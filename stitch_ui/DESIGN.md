# Design System Specification: The Kinetic Command Interface

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Kinetic Command Interface."** 

This is not a static layout; it is a high-fidelity instrument designed for precision, speed, and deep immersion. We are moving away from the "template" aesthetic of the modern web and toward an editorial, sci-fi-inspired HUD. The system leverages **Precise Brutalism**—defined by hard 0px edges and architectural rigidity—interfaced with **Atmospheric Depth**, achieved through tactical glassmorphism and luminous neon accents.

To break the "standard UI" feel, designers must embrace intentional asymmetry. Data should feel like it is being "projected" rather than "printed." Use overlapping elements and varying typographic scales to create a sense of hierarchy that feels like a futuristic command center from high-end cinema.

## 2. Colors & Luminous Depth
The palette is rooted in deep space blacks and technical greys, punctuated by a high-energy neon cyan.

### The Surface Hierarchy
We achieve depth not through shadows, but through **Tonal Layering**. 
*   **Base:** `surface` (#0e1418) is your canvas.
*   **Nesting:** Use `surface_container_low` (#161c21) for primary sections and `surface_container_high` (#252b2f) for interactive or elevated elements. 
*   **The "No-Line" Rule:** Prohibit the use of 1px solid borders to define sections. Boundaries must be established solely through background color shifts or subtle tonal transitions between `surface_container` tiers.

### The "Glass & Gradient" Rule
To achieve the tactical HUD look, floating panels must utilize **Tactical Glassmorphism**:
*   **Surface:** Use `surface_container_highest` (#30353a) at 60-70% opacity.
*   **Effect:** Apply a `backdrop-filter: blur(20px)`.
*   **Signature Textures:** For primary actions or critical data visualizations, use a linear gradient transitioning from `primary` (#e3fdff) to `primary_container` (#00f3ff).

### Accents & Glows
The `primary_container` (#00f3ff) is our "Active" state. When an element is energized, apply a subtle **Bloom Effect**: a drop-shadow with 0px offset, 12px blur, using the `primary_container` color at 30% opacity.

## 3. Typography: Technical Editorial
We utilize **Space Grotesk** across the entire system. Its geometric construction reinforces the "high-end machine" aesthetic.

*   **Display & Headline:** Use `display-lg` and `headline-lg` to create "Hero" moments for data. These should feel authoritative and cinematic.
*   **Data vs. Label:** Always maintain a high contrast ratio. Use `on_surface` (#dee3e9) for primary data points and `on_surface_variant` (#b9cacb) for labels.
*   **The Telemetry Look:** Use `label-sm` for technical meta-data. This small, all-caps styling mimics the readout of a tactical scanner.
*   **Hierarchy:** Shift between bold weights for headers and lighter weights for body text to ensure the "instrumental" feel isn't lost in a wall of text.

## 4. Elevation & Depth: Tonal Layering
In this design system, elevation is a product of light and layering, not physical height.

*   **The Layering Principle:** Place a `surface_container_lowest` (#090f13) card on top of a `surface_container_low` section to create a "recessed" look, or a `surface_bright` (#343a3f) card to create a "lifted" look.
*   **Ambient Glows:** Traditional shadows are replaced by ambient light. If a component is "Active," it should emit a soft glow using `surface_tint` (#00dce6) with a large blur (24px+) and low opacity (5%).
*   **The "Ghost Border" Fallback:** If a container requires a boundary for accessibility, use a "Ghost Border": the `outline_variant` (#3a494b) at 15% opacity. Never use 100% opaque borders.

## 5. Components & Micro-Interactions

### Buttons
*   **Primary:** Solid `primary_container` (#00f3ff) background with `on_primary_fixed` (#002022) text. 0px corner radius.
*   **Secondary:** Ghost style. `outline` (#849495) at 20% opacity with a `primary_container` hover state that triggers a subtle bloom glow.
*   **Tactical Detail:** Add a 2px "corner bracket" to buttons in the `primary_container` color to enhance the HUD feel.

### Active Status Indicators
*   Instead of a simple dot, use a "Pulse" micro-interaction. A small square of `primary_container` that subtly expands and fades in a loop, indicating a live data stream.

### Input Fields
*   **State:** Flat `surface_container_lowest` background. 
*   **Focus:** Transition the bottom border from `outline_variant` to a glowing `primary_container` line. 
*   **Shape:** Strictly 0px radius.

### Cards & Lists
*   **Rule:** Forbid divider lines. 
*   **Structure:** Use vertical whitespace from the spacing scale (e.g., 24px or 32px) to separate items. For lists, alternate background colors between `surface` and `surface_container_low` to create a "zebra-stripe" telemetry effect.

### Tech-Inspired Borders
*   Use "clipped" corners or non-continuous lines (lines that stop 10px before the corner) using the `outline_variant` to give the UI a modular, aerospace feel.

## 6. Do’s and Don’ts

### Do:
*   **Do** use 0px border radius for everything. Sharpness conveys precision.
*   **Do** use "Active" cyan sparingly. If everything glows, nothing is important.
*   **Do** use asymmetry. Align a data column to the far right while the header sits on the far left to create visual tension.
*   **Do** prioritize data legibility through high contrast (`on_surface` on `surface`).

### Don’t:
*   **Don't** use rounded corners. It breaks the "Tactical" logic of the system.
*   **Don't** use standard drop shadows. Use background blurs and glows instead.
*   **Don't** use 1px solid, high-contrast borders for layout sectioning.
*   **Don't** use generic transition timings. Use "Fast & Linear" or "Step-based" animations to mimic digital readouts.