# OAS nonprofit overlay — handoff package

Synthetic case laboratory for a nonprofit. A function is a responsibility, not a department. Mission results and money results stay apart. North River Family Services is invented data.

## Open it

- `lab.html` — the case lab. Open it in a browser. Nothing to install. Workspaces: Brief, Parties, Functions, Funds, Health, Scenario, Actions. Switch between North River and an empty case.
- `python cli.py` — the same case as text, from the engine.
- `python -m unittest test_nonprofit.py -v` — the numbers the engine is required to produce. Eleven checks. All must pass.

Python 3.11 or newer. No third-party packages.

## Who builds the installed app

`INSTRUCTIONS_FOR_ERIK.md` is the build order: an engine he runs, and an app the user runs, under an authorized work folder. He does not replace these formulas and he does not load a real ledger into this sample.

Give him this as the first instruction:

> Read INSTRUCTIONS_FOR_ERIK.md, then README.md. Run the unit tests and python cli.py. Open lab.html. Build the engine and the seven-workspace app from this package. One action per reply. Synthetic data only.

## Files

| File | Role |
|---|---|
| `engine.py` | Health, coverage, readiness, capacity, service realization, gates, prerequisite order |
| `catalog.py` | F01–F13 mission names, four parties, discovery questions, North River fixture |
| `cli.py` | Prints the fixture from the engine |
| `test_nonprofit.py` | Acceptance checks |
| `lab.html` | Reference app, no build step |
| `reference/case-lab.tsx` | Checked screen behavior |
| `reference/engine.ts` | Same formulas in TypeScript |
| `reference/catalog.ts` | Same function catalog in TypeScript |
| `INSTRUCTIONS_FOR_ERIK.md` | Build order and the rules he may not relax |

The product-sales weights are not used. Nonprofit objective weights, once a board confirms them: mission reach 30, beneficiary access 20, unrestricted stability 20, governance integrity 15, restriction compliance 10, continuity 5.