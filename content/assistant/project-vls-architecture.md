---
title: VLS — the interesting engineering problem
tags: [projects, vls, architecture, design-decisions]
---
What makes a vehicle location system interesting: one relentless write pattern, two very different read patterns. The write side never pauses — every active vehicle streams positions all day, and you can't ask a moving truck to resend yesterday. The read side splits: live tracking asks "where is vehicle X right now" (a latest-state lookup that must feel instant) while analytics asks "what did the fleet do over time" (range scans and aggregation). I designed the read APIs around access patterns rather than the raw table shape — latest-position reads kept cheap and separate from history, historical queries organized by vehicle and time window. The core lesson: design read APIs from the access pattern backwards, not the schema forwards.
