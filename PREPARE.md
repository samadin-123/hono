# Evaluation Setup

This file is outside the editable surface. It defines how results are judged. Agents cannot modify the evaluator or the scoring logic — the evaluation is the trust boundary.

Consider defining more than one evaluation criterion. Optimizing for a single number makes it easy to overfit and silently break other things. A secondary metric or sanity check helps keep the process honest.

eval_cores: 1
eval_memory_gb: 1.0
prereq_command: .polyresearch/build.sh

## Setup

Install dependencies and prepare the evaluation environment:

```bash
# Install bun (required for the build process)
curl -fsSL https://bun.sh/install | bash
export PATH="$HOME/.bun/bin:$PATH"

# Install Node.js dependencies
npm install

# Run the build to compile TypeScript to JavaScript
.polyresearch/build.sh
```

The `prereq_command` is set to `.polyresearch/build.sh` to ensure the TypeScript source is compiled before benchmarks run. This custom build script handles the compilation process and ensures the benchmark measures the actual compiled output, not stale artifacts.

## Run command

```bash
node .polyresearch/benchmark.mjs
```

This benchmark measures router matching performance for Hono's RegExpRouter. It:
- Sets up a router with 12 routes (static, dynamic with parameters, wildcard patterns)
- Performs 100,000 iterations of matching 12 test routes (1,200,000 total matches)
- Outputs operations per second as the performance metric
- Includes warmup phase to stabilize JIT compilation

## Output format

The benchmark must print `METRIC=<number>` to stdout.

## Metric parsing

The CLI looks for `METRIC=<number>` or `ops_per_sec=<number>` in the output.

## Ground truth

The baseline metric represents router matching operations per second for Hono's RegExpRouter implementation.

**What is measured:** Time to match HTTP routes against patterns (method + path) across various route types:
- Static routes (exact string match): `/user`, `/user/comments`
- Dynamic routes (with parameters): `/user/:id`, `/event/:id/comments`
- Wildcard routes: `/static/*`
- Nested dynamic routes: `/posts/:year/:month/:day`
- Long static paths: `/very/deeply/nested/route/hello/there`

**Test conditions:**
- 12 registered routes in the router (mix of static, dynamic parameter, and wildcard routes)
- 12 different test routes exercised per iteration
- 100,000 iterations (1,200,000 total route matches)
- Includes warmup phase (1,000 iterations) to stabilize JIT compilation
- Measured using high-resolution timer (process.hrtime.bigint)
- Baseline performance: ~7-12 million operations per second (varies by hardware)

**Why this metric matters:** Router performance is critical for web framework throughput. Every HTTP request requires route matching, so improvements here directly impact request handling capacity and latency.

**Secondary validation:** All existing unit tests must pass (`npm test`). This ensures performance improvements don't break correctness, type safety, or framework behavior.
