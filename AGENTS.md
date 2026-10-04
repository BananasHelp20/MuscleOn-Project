# Website design rules

Apply these rules to the entire website and all future changes. Only an explicit user instruction to override a rule permits an exception.

- Never use a font weight above 700, including CSS, inline styles, generated markup, canvas text, and chart configuration.
- Reserve font weight 700 for very important headlines and titles, such as the main page heading and the header brand title. Use 600 or less for section headings, controls, badges, counters, labels, and body emphasis.
- Do not use eyebrows: no small introductory labels or overlines above headings. Put necessary context in ordinary text or in the heading itself.
- Visually review every newly implemented feature in both light mode and dark mode before considering it complete. Its layout, colors, text contrast, controls, and interaction states must fit both themes. Use the existing theme variables or separate light-mode and dark-mode styles where needed. Code checks alone do not satisfy this requirement; if visual review is unavailable, report it as incomplete rather than claiming the feature is fully verified.
- When changing website typography or content, audit all pages and shared styles for these rules, including default browser bold styles.
