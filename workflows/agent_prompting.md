# Workflow: Agent Prompting Strategy

## Objective
Document the prompt design for each agent and how to tune them for quality debates.

## Agent Prompt Files
All prompts live in `backend/agents/prompts.py`.

## FOR Agent (`for_agent_node`)

**Model**: `claude-sonnet-4-6`
**Max tokens**: `MAX_ARGUMENT_TOKENS` (default: 600)

**System prompt structure**:
1. Role declaration: "You are arguing FOR: {topic}"
2. CREI structure reminder (Claim, Reasoning, Evidence, Impact)
3. Round context (Round N of M)
4. Opponent context (last AGAINST argument or "opening round")
5. Guidelines: 150-250 words, address opponent first, flowing prose

**Key design decisions**:
- Opponent context is injected by `build_opponent_context()` from history
- Flowing prose (no headers/bullets) makes arguments sound more natural
- Word limit keeps the debate focused and timely

## AGAINST Agent (`against_agent_node`)

Mirrors the FOR agent exactly but frames the role as arguing against the topic. Same CREI structure, same word guidelines.

## Judge Agent (`judge_node`)

**Model**: `claude-sonnet-4-6`
**Max tokens**: `MAX_JUDGE_TOKENS` (default: 800)

**System prompt structure**:
1. Role: impartial expert judge
2. Full FOR and AGAINST arguments for this round
3. Historical context (all prior rounds, first 200 chars each)
4. Scoring rubric with weights
5. JSON response format requirement

**JSON schema the judge must return**:
```json
{
  "for": {
    "argument_quality": 7.5,
    "responsiveness": 8.0,
    "impact_analysis": 6.5,
    "debate_skill": 8.0,
    "feedback": "..."
  },
  "against": { "...same structure..." },
  "round_summary": "..."
}
```

**Error handling**: If JSON parsing fails, falls back to 5.0 scores on all criteria. The debate continues; the flawed score is still persisted.

## Tuning Tips

### For more balanced debates
Adjust the system prompts to explicitly tell agents not to make concessions. Default prompts allow agents to acknowledge valid opposing points, which leads to more realistic debates.

### For faster execution
Reduce `MAX_ARGUMENT_TOKENS` in `.env`. 300 tokens produces shorter but still structured arguments.

### For domain-specific debates
Inject domain context into the system prompt: "This is a policy debate; cite real legislation and statistics." Modify `FOR_SYSTEM_PROMPT` and `AGAINST_SYSTEM_PROMPT` in `prompts.py`.

### For stricter judging
Add to `JUDGE_SYSTEM_PROMPT`: "Penalize any argument that makes an unsubstantiated factual claim by deducting 1 point from argument_quality."

## History Context
- `build_opponent_context()`: Builds the "your opponent said X" paragraph from the last completed round
- `build_history_context()`: Gives the judge a summary of all prior rounds (first 200 chars each) so judging scores reflect progression of the debate, not just the current round in isolation
