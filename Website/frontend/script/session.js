// The session preview consumes the same WebSocket signal that hardware will use later.
// Rep and set counts are local demo estimates until the hardware pipeline is connected.
(function () {
    const REST_MS = 10000;
    const NOTICE_MS = 2000;
    const NOTICE_EXIT_MS = 160;
    const SIGNAL_MAX = 4500;
    const HIGH_THRESHOLD = 1350;
    const LOW_THRESHOLD = 700;
    const points = [];
    const page = document.getElementById('session-page');
    if (!page) return;

    let socket = null;
    let pollTimer = null;
    let reconnectTimer = null;
    let signalRunning = false;
    let graphVisible = false;
    let frozenGraphTime = Date.now();
    let signalRequest = null;
    let graphAnimation = null;
    let plans = [];
    let user = null;
    let state = null;
    let storageKey = null;
    let propertyWrite = Promise.resolve();
    let sequenceKey = '';
    let noticeTimer = null;
    let noticeExitTimer = null;
    let noticeReturnFocus = null;
    let previousRender = null;
    let pendingWorkoutMotion = null;
    const workoutAnimations = new WeakMap();
    let timelineAnimation = null;
    let timelineExpanded = null;

    const element = (id) => document.getElementById(id);
    const text = (id, value) => { element(id).textContent = value; };
    const currentPlan = () => plans[state ? state.planIndex : Number(element('sessionPlan').value)];
    const currentExercise = () => currentPlan()?.exercises?.[state?.exerciseIndex];
    const target = (value) => Math.max(1, Number.parseInt(value, 10) || 1);

    function dismissNotice() {
        const notice = element('sessionNotice');
        if (notice.hidden || notice.classList.contains('notice-leaving')) return;
        clearTimeout(noticeTimer);
        clearTimeout(noticeExitTimer);
        const finish = () => {
            const returnFocus = notice.contains(document.activeElement);
            notice.hidden = true;
            notice.classList.remove('notice-leaving');
            element('workoutContent').inert = false;
            element('workoutContent').classList.remove('workout-obscured');
            if (returnFocus && noticeReturnFocus?.isConnected) noticeReturnFocus.focus({ preventScroll: true });
            noticeReturnFocus = null;
            if (pendingWorkoutMotion) {
                const motion = pendingWorkoutMotion;
                pendingWorkoutMotion = null;
                motion();
            }
        };
        element('workoutContent').classList.remove('workout-obscured');
        notice.classList.remove('notice-visible');
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return finish();
        }
        notice.classList.add('notice-leaving');
        noticeExitTimer = setTimeout(finish, NOTICE_EXIT_MS);
    }

    function showSessionNotice(kind, title, message) {
        const notice = element('sessionNotice');
        clearTimeout(noticeTimer);
        clearTimeout(noticeExitTimer);
        notice.classList.remove('notice-visible', 'notice-leaving');
        notice.dataset.kind = kind;
        notice.setAttribute('role', kind === 'error' ? 'alert' : 'status');
        notice.setAttribute('aria-live', kind === 'error' ? 'assertive' : 'polite');
        text('sessionNoticeTitle', title);
        text('sessionNoticeMessage', message);
        notice.hidden = false;
        const content = element('workoutContent');
        const focusWasInside = content.contains(document.activeElement);
        if (focusWasInside) noticeReturnFocus = document.activeElement;
        content.inert = true;
        content.classList.add('workout-obscured');
        if (focusWasInside) element('dismissSessionNotice').focus({ preventScroll: true });
        // Restart the entrance animation when a new event replaces the message.
        void notice.offsetWidth;
        notice.classList.add('notice-visible');
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        noticeTimer = setTimeout(dismissNotice, reducedMotion ? NOTICE_MS : NOTICE_MS - NOTICE_EXIT_MS);
    }

    function saveState() {
        if (state) sessionStorage.setItem(storageKey, JSON.stringify(state));
        else sessionStorage.removeItem(storageKey);
    }

    function syncTrainingProperties() {
        if (!user) return propertyWrite;
        const properties = { ...getUserPropertiesFromLocalStorage(),
            currentlyTraining: Boolean(state),
            currentlyInExercise: Boolean(state && !state.paused),
            pausedSession: Boolean(state?.paused) };
        user.userProperties = properties;
        localStorage.setItem('userProperties', JSON.stringify(properties));
        propertyWrite = propertyWrite.catch(() => {}).then(() => setUserProperties(properties)).catch(error => {
            console.error('Could not save session state:', error);
            text('sessionStatus', 'Session state could not be saved. Check the server connection.');
        });
        return propertyWrite;
    }

    function scheduleLabel(plan) {
        const time = plan.times || {};
        const day = time.weekday || 'Unscheduled';
        const hours = time.fromTime ? `, ${time.fromTime}${time.toTime ? '–' + time.toTime : ''}` : '';
        return `${day}${hours} · ${plan.primaryMuscleGroup || 'Workout'}`;
    }

    function isWithinStartWindow(plan, startedAt = Date.now()) {
        const time = plan?.times;
        if (!time?.weekday || !time?.fromTime) return false;
        const date = new Date(startedAt);
        const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const scheduledDay = weekdays.indexOf(time.weekday);
        if (scheduledDay < 0) return false;
        const [hour, minute] = time.fromTime.split(':').map(Number);
        if (!Number.isFinite(hour) || !Number.isFinite(minute)) return false;
        const scheduled = new Date(date);
        scheduled.setDate(date.getDate() + scheduledDay - date.getDay());
        scheduled.setHours(hour, minute, 0, 0);
        return [-7, 0, 7].some(weeks => Math.abs(startedAt - (scheduled.getTime() + weeks * 86400000)) <= 30 * 60000);
    }

    function renderSchedule() {
        const plan = currentPlan();
        if (!plan) {
            element('scheduleWindow').innerHTML = 'No training plan saved yet. <a href="./settings.html">Create one in Settings</a>.';
            return;
        }
        text('scheduleWindow', state && isWithinStartWindow(plan, state.startedAt)
            ? 'Started within the planned 30-minute window. This demo does not record attendance.'
            : 'Planned workouts count toward the schedule only when started within 30 minutes of the chosen time and completed. Attendance tracking is not connected yet.');
    }

    function revealCurrentExercise() {
        if (timelineAnimation) return;
        const list = element('exerciseSequence');
        const current = list.querySelector('[aria-current="step"]');
        if (!current || !list.parentElement.open) return;
        const bounds = list.getBoundingClientRect();
        const entry = current.getBoundingClientRect();
        const offset = entry.top < bounds.top ? entry.top - bounds.top - 4
            : entry.bottom > bounds.bottom ? entry.bottom - bounds.bottom + 4 : 0;
        if (offset) list.scrollBy({ top: offset, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    }

    function toggleExerciseDropdown(event) {
        event.preventDefault();
        const list = element('exerciseSequence');
        const details = list.parentElement;
        const summary = details.querySelector('summary');
        const expanded = !(timelineExpanded ?? details.open);
        timelineExpanded = expanded;
        summary.setAttribute('aria-expanded', String(expanded));
        const currentHeight = details.open ? list.getBoundingClientRect().height : 0;
        const currentStyles = getComputedStyle(list);
        const from = { height: `${currentHeight}px`, opacity: details.open ? currentStyles.opacity : 0,
            marginTop: details.open ? currentStyles.marginTop : '0px',
            paddingTop: details.open ? currentStyles.paddingTop : '0px',
            paddingBottom: details.open ? currentStyles.paddingBottom : '0px' };
        if (timelineAnimation) { timelineAnimation.cancel(); timelineAnimation = null; }
        list.classList.remove('timeline-animating');
        const finish = () => {
            details.open = expanded;
            list.classList.remove('timeline-animating');
            timelineAnimation = null;
            if (expanded) revealCurrentExercise();
        };
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !list.animate) return finish();
        // Keep native details open until the closing animation finishes.
        details.open = true;
        const styles = getComputedStyle(list);
        const to = expanded ? { height: `${list.getBoundingClientRect().height}px`, opacity: 1,
            marginTop: styles.marginTop, paddingTop: styles.paddingTop, paddingBottom: styles.paddingBottom }
            : { height: '0px', opacity: 0, marginTop: '0px', paddingTop: '0px', paddingBottom: '0px' };
        list.classList.add('timeline-animating');
        timelineAnimation = list.animate([from, to], {
            duration: expanded ? 360 : 280, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'both'
        });
        const animation = timelineAnimation;
        animation.onfinish = () => {
            if (timelineAnimation !== animation) return;
            finish();
            animation.cancel();
        };
    }

    function renderSequence() {
        const list = element('exerciseSequence');
        const plan = currentPlan();
        text('timelineCurrent', state && currentExercise()
            ? `${state.exerciseIndex + 1} of ${plan.exercises.length} · ${currentExercise().name}`
            : `${plan?.exercises?.length || 0} exercises ready`);
        const key = JSON.stringify([plan?.exercises, state?.exerciseIndex, state?.skippedExercises, state?.paused]);
        if (key === sequenceKey) return;
        sequenceKey = key;
        const planKey = JSON.stringify(plan?.exercises);
        if (list.dataset.plan !== planKey) {
            list.dataset.plan = planKey;
            list.replaceChildren();
        }
        if (!plan?.exercises?.length) {
            list.replaceChildren();
            const item = document.createElement('li');
            item.classList.add('timeline-empty');
            item.textContent = 'No exercises in this training day.';
            list.appendChild(item);
            return;
        }
        plan.exercises.forEach((exercise, index) => {
            const item = list.children[index] || document.createElement('li');
            const existing = Boolean(item.parentElement);
            const skipped = state?.skippedExercises?.includes(index);
            const done = state && index < state.exerciseIndex;
            const current = state && index === state.exerciseIndex;
            item.classList.remove('done', 'skipped', 'current');
            item.removeAttribute('aria-current');
            if (done) item.classList.add(skipped ? 'skipped' : 'done');
            if (current) {
                item.classList.add('current');
                item.setAttribute('aria-current', 'step');
            }
            const node = existing ? item.children[0] : document.createElement('span');
            node.className = 'timeline-node';
            node.textContent = done && !skipped ? '✓' : index + 1;
            node.setAttribute('aria-hidden', 'true');
            const entry = existing ? item.children[1] : document.createElement('div');
            entry.className = 'timeline-entry';
            const name = existing ? entry.children[0] : document.createElement('strong');
            name.textContent = exercise.name || 'Exercise';
            const detail = existing ? entry.children[1] : document.createElement('span');
            detail.textContent = `${target(exercise.reps)} reps × ${target(exercise.sets)} sets`;
            const status = existing ? entry.children[2] : document.createElement('span');
            status.className = 'timeline-state';
            status.textContent = skipped ? 'Skipped' : done ? 'Complete' : current ? (state.paused ? 'Paused' : 'Current exercise') : 'Up next';
            if (!existing) {
                entry.append(name, detail, status);
                item.append(node, entry);
                list.appendChild(item);
            }
        });
        requestAnimationFrame(revealCurrentExercise);
    }

    function renderSession() {
        const active = Boolean(state);
        const progress = element('sessionProgress');
        const previous = previousRender;
        const next = { active, paused: Boolean(state?.paused), exerciseIndex: state?.exerciseIndex,
            progressHeight: progress.hidden ? 0 : progress.getBoundingClientRect().height };
        element('workoutContent').dataset.sessionState = active ? (next.paused ? 'paused' : 'running') : 'idle';
        setSignalVisibility(active);
        setSignalRunning(active && !state.paused);
        const exercise = currentExercise();
        element('sessionPlan').disabled = active;
        progress.hidden = !active && !previous?.active;
        element('resumePauseSession').hidden = !active;
        element('startSkipExercise').hidden = !active;
        element('startStopSession').disabled = !active && !currentPlan()?.exercises?.length;
        text('startStopSession', active ? 'End session' : 'Start session');
        text('resumePauseSession', state?.paused ? 'Resume' : 'Pause');
        text('sessionStatus', active ? (state.paused ? 'Session paused' : 'Session in progress · simulated signal') : 'Choose a saved training day to begin.');
        if (active && exercise) {
            text('exercisePosition', `${state.exerciseIndex + 1} of ${currentPlan().exercises.length}`);
            text('currentExercise', exercise.name || 'Exercise');
            text('exerciseMuscles', (exercise.targetedMuscleGroups || []).join(', ') || 'Muscle group not specified');
            text('repDisplay', state.reps > target(exercise.reps) ? `${target(exercise.reps)} + ${state.reps - target(exercise.reps)}` : state.reps);
            text('repTarget', `of ${target(exercise.reps)} reps`);
            text('setDisplay', state.sets);
            text('setTarget', `of ${target(exercise.sets)} sets complete`);
            text('setFeedback', state.feedback || 'Waiting for a contraction.');
        }
        renderSchedule();
        renderSequence();
        // Only animate session changes; incoming samples never restart the transition.
        previousRender = next;
        if (previous && (previous.active !== next.active || previous.paused !== next.paused || previous.exerciseIndex !== next.exerciseIndex)) {
            const motion = () => animateWorkoutChange(previous, next);
            if (!element('sessionNotice').hidden && next.active) pendingWorkoutMotion = motion;
            else { pendingWorkoutMotion = null; motion(); }
        }
    }

    function animateWorkoutElement(node, frames, options = {}) {
        if (!node) return null;
        workoutAnimations.get(node)?.cancel();
        if (node === element('sessionProgress')) node.classList.remove('progress-animating');
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !node.animate) return null;
        const animation = node.animate(frames, {
            duration: 360, easing: 'cubic-bezier(.22, 1, .36, 1)', ...options
        });
        workoutAnimations.set(node, animation);
        return animation;
    }

    function animateWorkoutChange(previous, next) {
        const progress = element('sessionProgress');
        const list = element('exerciseSequence');
        const current = list.querySelector('[aria-current="step"]');
        const rise = [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'translateY(0)' }];
        const settle = [{ transform: 'scale(.88)' }, { transform: 'scale(1.08)', offset: .65 }, { transform: 'scale(1)' }];
        animateWorkoutElement(element('sessionStatus'), rise, { duration: 260 });
        animateWorkoutElement(element('timelineCurrent'), rise, { duration: 280 });

        if (previous.active !== next.active) {
            const styles = getComputedStyle(progress);
            const expanded = { height: `${progress.getBoundingClientRect().height}px`, paddingTop: styles.paddingTop,
                marginTop: styles.marginTop, opacity: 1 };
            const collapsed = { height: '0px', paddingTop: '0px', marginTop: '0px', opacity: 0 };
            const animation = animateWorkoutElement(progress, next.active ? [collapsed, expanded] : [expanded, collapsed], {
                duration: next.active ? 440 : 260
            });
            if (animation) {
                progress.classList.add('progress-animating');
                animation.onfinish = () => {
                    if (workoutAnimations.get(progress) !== animation) return;
                    progress.classList.remove('progress-animating');
                    progress.hidden = !state;
                };
            } else {
                progress.classList.remove('progress-animating');
                progress.hidden = !next.active;
            }
            if (next.active) {
                Array.from(progress.children).forEach((child, index) => {
                    animateWorkoutElement(child, rise, { duration: 420, delay: 60 + index * 35, fill: 'backwards' });
                });
                Array.from(list.children).forEach((row, index) => {
                    animateWorkoutElement(row, rise, { duration: 400, delay: Math.min(index, 6) * 45, fill: 'backwards' });
                });
                animateWorkoutElement(element('resumePauseSession'), rise, { delay: 40, fill: 'backwards' });
                animateWorkoutElement(element('startSkipExercise'), rise, { delay: 80, fill: 'backwards' });
            }
        } else if (previous.exerciseIndex !== next.exerciseIndex) {
            // Fade the new exercise into place while the timeline moves to its next step.
            Array.from(progress.children).forEach((child, index) => {
                animateWorkoutElement(child, [{ opacity: 0, transform: 'translateX(16px)' }, { opacity: 1, transform: 'translateX(0)' }],
                    { duration: 380, delay: index * 25, fill: 'backwards' });
            });
            const previousRow = list.children[previous.exerciseIndex];
            animateWorkoutElement(previousRow?.querySelector('.timeline-node'), settle, { duration: 420 });
            animateWorkoutElement(current, rise, { duration: 440 });
            animateWorkoutElement(current?.querySelector('.timeline-node'), settle, { duration: 480 });
            if (previous.progressHeight) animateWorkoutElement(progress,
                [{ height: `${previous.progressHeight}px` }, { height: `${progress.getBoundingClientRect().height}px` }], { duration: 380 });
        } else if (previous.paused !== next.paused) {
            animateWorkoutElement(element('setFeedback'), rise, { duration: 300 });
            animateWorkoutElement(element('resumePauseSession'), settle, { duration: 320 });
            animateWorkoutElement(current?.querySelector('.timeline-node'), settle, { duration: 420 });
            if (next.paused) animateWorkoutElement(current?.querySelector('.timeline-entry'),
                [{ transform: 'translateY(5px)' }, { transform: 'translateY(0)' }], { duration: 380 });
        }
        if (next.active && !next.paused) {
            const entry = current?.querySelector('.timeline-entry');
            if (entry) {
                const glow = getComputedStyle(page).getPropertyValue('--timeline-glow').trim();
                animateWorkoutElement(entry, [{ boxShadow: `0 0 0 3px ${glow}` },
                    { boxShadow: `0 0 0 7px ${glow}`, offset: .4 }, { boxShadow: `0 0 0 3px ${glow}` }], { duration: 650 });
            }
        }
    }

    function finishSession(completed) {
        const plan = currentPlan();
        const startedAt = state?.startedAt;
        state = null;
        saveState();
        syncTrainingProperties();
        renderSession();
        text('sessionStatus', completed
            ? `Demo workout complete${isWithinStartWindow(plan, startedAt) ? ' · started in the planned window' : ''}. Attendance is not recorded yet.`
            : 'Session ended before all exercises were complete.');
        if (completed) showSessionNotice('success', 'Workout complete', 'You finished every exercise in this demo session.');
    }

    function advanceExercise(skipped = false) {
        if (skipped) {
            state.skippedExercises = state.skippedExercises || [];
            state.skippedExercises.push(state.exerciseIndex);
        }
        state.exerciseIndex += 1;
        state.reps = 0;
        state.sets = 0;
        state.above = false;
        state.lastRepAt = 0;
        if (state.exerciseIndex >= currentPlan().exercises.length) {
            finishSession(!state.skippedExercises?.length);
            return;
        }
        state.feedback = 'Next exercise started. Waiting for a contraction.';
        saveState();
        renderSession();
    }

    function consumeSignal(value) {
        if (!state || state.paused || !currentExercise()) return;
        const now = Date.now();
        if (value < LOW_THRESHOLD) state.above = false;
        if (value >= HIGH_THRESHOLD && !state.above && now - state.lastRepAt > 650) {
            state.above = true;
            state.reps += 1;
            state.lastRepAt = now;
            state.feedback = state.reps < target(currentExercise().reps)
                ? 'Keep going to reach the rep target.'
                : 'Target reached. Rest for 10 seconds to complete the set.';
            if (state.reps === target(currentExercise().reps)) {
                showSessionNotice('success', 'Target reached', 'Rest for 10 seconds to finish this set.');
            }
            saveState();
            renderSession();
        }
    }

    function checkRest() {
        if (!state || state.paused || !state.reps || Date.now() - state.lastRepAt < REST_MS) return;
        if (state.reps < target(currentExercise().reps)) {
            state.feedback = `Stopped early: ${state.reps} of ${target(currentExercise().reps)} reps. Start this set again.`;
            showSessionNotice('error', 'Stopped early', `${state.reps} of ${target(currentExercise().reps)} reps. Start this set again.`);
            state.reps = 0;
        } else {
            state.sets += 1;
            state.reps = 0;
            state.feedback = `Set ${state.sets} complete after 10 seconds of rest.`;
            showSessionNotice('success', 'Set complete', `${currentExercise().name}: set ${state.sets} of ${target(currentExercise().sets)} finished.`);
        }
        state.lastRepAt = 0;
        state.above = false;
        if (state.sets >= target(currentExercise().sets)) advanceExercise();
        else { saveState(); renderSession(); }
    }

    function initializeSessionPage() {
        user = getUserDataFromLocalStorage();
        plans = (user?.userProperties?.usualSessionTimes || []).filter(plan => Array.isArray(plan.exercises));
        storageKey = `muscleon_demo_session_${user?.userProperties?.userId ?? 'guest'}`;
        try {
            state = JSON.parse(sessionStorage.getItem(storageKey) || 'null');
        } catch { state = null; }
        if (state && (!plans[state.planIndex]?.exercises?.[state.exerciseIndex])) state = null;
        const select = element('sessionPlan');
        select.replaceChildren();
        plans.forEach((plan, index) => select.add(new Option(scheduleLabel(plan), index)));
        if (state) select.value = String(state.planIndex);
        else {
            const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
            const todayIndex = plans.findIndex(plan => plan.times?.weekday === today);
            if (todayIndex >= 0) select.value = String(todayIndex);
        }
        select.addEventListener('change', renderSession);
        element('exerciseSequence').parentElement.addEventListener('toggle', revealCurrentExercise);
        const timelineSummary = element('exerciseSequence').parentElement.querySelector('summary');
        timelineSummary.setAttribute('aria-expanded', String(element('exerciseSequence').parentElement.open));
        timelineSummary.addEventListener('click', toggleExerciseDropdown);
        element('sessionLoginNotice').hidden = true;
        renderSession();
        element('startStopSession').addEventListener('click', () => {
            if (state) return finishSession(false);
            if (!currentPlan()?.exercises?.length) return;
            state = { planIndex: Number(select.value), exerciseIndex: 0, reps: 0, sets: 0,
                paused: false, above: false, lastRepAt: 0, startedAt: Date.now(), feedback: 'Waiting for a contraction.' };
            saveState();
            syncTrainingProperties();
            renderSession();
        });
        element('resumePauseSession').addEventListener('click', () => {
            if (!state) return;
            state.paused = !state.paused;
            if (!state.paused) state.lastRepAt = Date.now();
            state.feedback = state.paused ? 'Paused. Rep and set counts are on hold.' : 'Resumed. Continue your set.';
            saveState();
            syncTrainingProperties();
            renderSession();
        });
        element('startSkipExercise').addEventListener('click', () => { if (state) advanceExercise(true); });
        setInterval(checkRest, 250);
    }

    function drawGraph() {
        if (!graphVisible) return;
        const canvas = element('signalCanvas');
        const bounds = canvas.getBoundingClientRect();
        if (!bounds.width || !bounds.height) return;
        const ratio = window.devicePixelRatio || 1;
        canvas.width = Math.round(bounds.width * ratio);
        canvas.height = Math.round(bounds.height * ratio);
        const ctx = canvas.getContext('2d');
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        const width = bounds.width, height = bounds.height;
        const padding = { left: 48, right: 16, top: 16, bottom: 30 };
        const plotWidth = width - padding.left - padding.right;
        const plotHeight = height - padding.top - padding.bottom;
        const styles = getComputedStyle(page);
        ctx.clearRect(0, 0, width, height);
        ctx.font = '12px Segoe UI, sans-serif';
        ctx.fillStyle = styles.getPropertyValue('--muted').trim() || '#667';
        ctx.strokeStyle = styles.getPropertyValue('--line').trim() || '#ccd';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 3; i++) {
            const y = padding.top + plotHeight * i / 3;
            ctx.beginPath(); ctx.moveTo(padding.left, y); ctx.lineTo(width - padding.right, y); ctx.stroke();
            ctx.fillText(String(SIGNAL_MAX * (3 - i) / 3), 4, y + 4);
        }
        // Show elapsed seconds, with fewer ticks on narrow screens to avoid overlap.
        const tickSeconds = plotWidth >= 360 ? 5 : 10;
        for (let secondsAgo = 30; secondsAgo >= 0; secondsAgo -= tickSeconds) {
            const x = padding.left + (1 - secondsAgo / 30) * plotWidth;
            ctx.beginPath();
            ctx.moveTo(x, padding.top);
            ctx.lineTo(x, padding.top + plotHeight);
            ctx.stroke();
            ctx.textAlign = secondsAgo === 30 ? 'left' : secondsAgo === 0 ? 'right' : 'center';
            ctx.fillText(secondsAgo === 0 ? 'now' : `-${secondsAgo}s`, x, height - 6);
        }
        ctx.textAlign = 'left';
        if (signalRunning) frozenGraphTime = Date.now();
        const cutoff = frozenGraphTime - 30000;
        while (points.length && points[0].time < cutoff) points.shift();
        if (!points.length) return;
        ctx.beginPath();
        points.forEach((point, index) => {
            const x = padding.left + Math.max(0, (point.time - cutoff) / 30000) * plotWidth;
            const y = padding.top + (1 - point.value / SIGNAL_MAX) * plotHeight;
            if (index === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = styles.getPropertyValue('--brand').trim() || '#10a9aa';
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.stroke();
    }

    function receiveSignal(data) {
        if (!signalRunning || !state) return;
        const value = Number(data.muscleUsage);
        if (!Number.isFinite(value)) return;
        points.push({ time: Date.now(), value: Math.max(0, Math.min(SIGNAL_MAX, value)) });
        drawGraph();
        consumeSignal(value);
    }

    async function pollSignal() {
        if (!signalRunning || signalRequest) return;
        const request = new AbortController();
        signalRequest = request;
        try {
            const response = await fetch('/api/liveData', { signal: request.signal });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            if (!signalRunning || signalRequest !== request) return;
            receiveSignal(data);
            text('signalConnection', 'Live demo');
        } catch {
            if (signalRunning && signalRequest === request && !request.signal.aborted) text('signalConnection', 'Signal unavailable');
        } finally {
            if (signalRequest === request) signalRequest = null;
        }
    }

    function startPolling() {
        if (!signalRunning || pollTimer) return;
        pollSignal();
        pollTimer = setInterval(pollSignal, 500);
    }

    function connectSignal() {
        if (!signalRunning || socket) return;
        if (!window.WebSocket) return startPolling();
        const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
        const clientId = `session_${Math.random().toString(36).slice(2)}`;
        const connection = new WebSocket(`${protocol}//${location.host}/ws/liveData?clientId=${clientId}`);
        socket = connection;
        connection.addEventListener('open', () => {
            if (!signalRunning || socket !== connection) return;
            if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
            if (signalRequest) { signalRequest.abort(); signalRequest = null; }
            text('signalConnection', 'Live demo');
        });
        connection.addEventListener('message', event => {
            if (!signalRunning || socket !== connection) return;
            try { receiveSignal(JSON.parse(event.data)); } catch { /* Ignore malformed samples. */ }
        });
        connection.addEventListener('close', () => {
            if (!signalRunning || socket !== connection) return;
            socket = null;
            startPolling();
            reconnectTimer = setTimeout(connectSignal, 3000);
        });
        connection.addEventListener('error', () => connection.close());
    }

    function stopSignalConnection() {
        clearTimeout(reconnectTimer);
        clearInterval(pollTimer);
        reconnectTimer = null;
        pollTimer = null;
        if (signalRequest) { signalRequest.abort(); signalRequest = null; }
        const connection = socket;
        socket = null;
        if (connection) connection.close();
    }

    function setSignalRunning(running) {
        if (!running && graphVisible) text('signalConnection', 'Paused');
        if (signalRunning === running) return;
        signalRunning = running;
        if (running) {
            text('signalConnection', 'Connecting…');
            connectSignal();
        } else {
            stopSignalConnection();
        }
    }

    function setSignalVisibility(visible) {
        if (graphVisible === visible) return;
        graphVisible = visible;
        const panel = element('liveSignalSection');
        if (graphAnimation) { graphAnimation.cancel(); graphAnimation = null; }
        panel.classList.remove('signal-animating');
        if (visible) {
            points.length = 0;
            frozenGraphTime = Date.now();
            panel.hidden = false;
            requestAnimationFrame(drawGraph);
        } else {
            setSignalRunning(false);
        }
        const finish = () => {
            panel.hidden = !graphVisible;
            panel.classList.remove('signal-animating');
            graphAnimation = null;
            if (!graphVisible) points.length = 0;
        };
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !panel.animate) return finish();
        const styles = getComputedStyle(panel);
        const expanded = { height: `${panel.getBoundingClientRect().height}px`, paddingTop: styles.paddingTop,
            paddingBottom: styles.paddingBottom, marginBottom: styles.marginBottom, opacity: 1, transform: 'translateY(0)' };
        const collapsed = { height: '0px', paddingTop: '0px', paddingBottom: '0px', marginBottom: '0px',
            opacity: 0, transform: 'translateY(-12px)' };
        panel.classList.add('signal-animating');
        graphAnimation = panel.animate(visible ? [collapsed, expanded] : [expanded, collapsed], {
            duration: visible ? 380 : 280, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'both'
        });
        const animation = graphAnimation;
        animation.onfinish = () => {
            if (graphAnimation !== animation) return;
            finish();
            animation.cancel();
        };
    }

    document.addEventListener('DOMContentLoaded', () => {
        element('dismissSessionNotice').addEventListener('click', dismissNotice);
        const notice = element('sessionNotice');
        notice.addEventListener('click', dismissNotice);
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && !notice.hidden) dismissNotice();
        });
        window.addEventListener('resize', drawGraph);
        window.addEventListener('beforeunload', () => {
            signalRunning = false;
            stopSignalConnection();
        });
    });
    window.initializeSessionPage = initializeSessionPage;
})();
