Card for a single bike in the fleet. Same visual language as `PackageCard` (photo placeholder box on top with a tokenized gradient + a text block below), simplified: no price, no features list, no CTA. Shown in a 2-column grid on the About page ("Our fleet" section).

The category badge (top-right) uses the neutral tone, not the red "highlight" tone `PackageCard` uses — this badge is a taxonomy label ("Enduro" / "Trail & Adventure"), not a promotional flag.

```jsx
<FleetCard name="Husqvarna TE 300" displacementCc={300} categoryLabel="Enduro"
  description="Our go-to enduro bike for technical singletrack and rocky climbs." />
```
