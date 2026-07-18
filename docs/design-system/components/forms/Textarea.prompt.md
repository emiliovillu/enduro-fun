Multi-line text field for longer form input (contact message, trip notes). Same border/radius/focus language as Input; vertical resize only.

```jsx
<Textarea placeholder="Tell us your level and dates…" rows={4} />
<Textarea defaultValue="Not enough detail" invalid />
```

Props: `rows` (default `4`), `invalid` (red border for validation errors), `disabled`.
