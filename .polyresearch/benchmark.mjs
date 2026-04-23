#!/usr/bin/env node
/**
 * Router performance benchmark for Hono
 * Measures operations per second for router matching across various route patterns
 * Based on the standard Hono router benchmark suite
 */

import { RegExpRouter } from '../dist/router/reg-exp-router/index.js'

const routes = [
  { method: 'GET', path: '/user' },
  { method: 'GET', path: '/user/comments' },
  { method: 'GET', path: '/user/avatar' },
  { method: 'GET', path: '/user/lookup/username/:username' },
  { method: 'GET', path: '/user/lookup/email/:address' },
  { method: 'GET', path: '/event/:id' },
  { method: 'GET', path: '/event/:id/comments' },
  { method: 'POST', path: '/event/:id/comment' },
  { method: 'GET', path: '/map/:location/events' },
  { method: 'GET', path: '/status' },
  { method: 'GET', path: '/very/deeply/nested/route/hello/there' },
  { method: 'GET', path: '/static/*' },
]

const testRoutes = [
  { method: 'GET', path: '/user' },
  { method: 'GET', path: '/user/comments' },
  { method: 'GET', path: '/user/avatar' },
  { method: 'GET', path: '/user/lookup/username/john' },
  { method: 'GET', path: '/user/lookup/email/test@example.com' },
  { method: 'GET', path: '/event/abcd1234' },
  { method: 'GET', path: '/event/abcd1234/comments' },
  { method: 'POST', path: '/event/abcd1234/comment' },
  { method: 'GET', path: '/map/seattle/events' },
  { method: 'GET', path: '/status' },
  { method: 'GET', path: '/very/deeply/nested/route/hello/there' },
  { method: 'GET', path: '/static/index.html' },
]

function createRouter() {
  const router = new RegExpRouter()
  const handler = () => {}

  for (const route of routes) {
    router.add(route.method, route.path, handler)
  }

  return router
}

function benchmark(router, iterations = 100000) {
  const start = process.hrtime.bigint()

  for (let i = 0; i < iterations; i++) {
    for (const route of testRoutes) {
      router.match(route.method, route.path)
    }
  }

  const end = process.hrtime.bigint()
  const durationNs = Number(end - start)
  const durationSec = durationNs / 1e9
  const totalOps = iterations * testRoutes.length
  const opsPerSec = totalOps / durationSec

  return opsPerSec
}

function main() {
  const router = createRouter()

  // Warmup
  benchmark(router, 1000)

  // Actual benchmark
  const opsPerSec = benchmark(router, 100000)

  console.log(`METRIC=${opsPerSec.toFixed(2)}`)
}

main()
