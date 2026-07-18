Single-line text field for forms (contact form, newsletter signup). Hairline border, generous radius, single amber focus ring — no gradients.

```jsx
<Input placeholder="Full name" />
<Input type="email" placeholder="Email" invalid />
<Input placeholder="Locked" disabled />
```

Props: `type` (`text` default, `email`, `tel`, `password`), `invalid` (red border for validation errors), `disabled`.
