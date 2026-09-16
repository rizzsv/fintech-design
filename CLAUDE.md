## Design Reference Handling

When working on frontend/UI tasks:
1. Always use the `Read` tool to load image files — never treat image paths as strings
2. Design references are located in `docs/design/` — read them as images before writing any UI code
3. After reading the reference image, describe the layout structure first, then implement
4. Match spacing, typography, and color exactly from the reference — do not improvise
5. If reference is unclear, re-read the image before asking

## Frontend Task Routing

For slicing/UI tasks:
- Primary reference: image files in `docs/design/`
- Secondary reference: `docs/frontend.md` for component rules
- Always pixel-match the reference, not approximate

## Reference Priority Order

1. Image files in docs/design/ (highest priority for UI)
2. API contract docs
3. Business rules MD
4. General instructions

## Model Routing

When spawning subagents or delegating tasks, use these models:

- **Orchestrator / planning**: kr/claude-opus-4.5-thinking-agentic
- **Frontend / UI / slicing**: kr/gpt-5.6-terra-thinking-agentic  
- **Backend / API / logic**: kr/claude-sonnet-4.5-thinking-agentic
- **Quick tasks / boilerplate / rename**: kr/claude-haiku-4.5-thinking-agentic
- **Component structure / Tailwind**: kr/deepseek-3.2

Always read image references using the Read tool before writing any UI code.