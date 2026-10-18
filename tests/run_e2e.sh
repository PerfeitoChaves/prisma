#!/usr/bin/env bash
# ==============================================================================
# PRISMA (Fatos Cruzados) — Automated E2E & Integration Test Runner
# ==============================================================================
set -eo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${PROJECT_ROOT}"

VENV_PYTHON="${PROJECT_ROOT}/.venv/bin/python"

if [ ! -f "${VENV_PYTHON}" ]; then
  echo "Error: Python virtual environment not found at ${VENV_PYTHON}"
  exit 1
fi

echo "=============================================================================="
echo "PRISMA E2E & INTEGRATION TEST SUITE"
echo "Project Root: ${PROJECT_ROOT}"
echo "Date / Time:  $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "Runner:       ${VENV_PYTHON}"
echo "=============================================================================="

# Run full unittest discovery across tests/e2e
"${VENV_PYTHON}" -m unittest discover -s "${PROJECT_ROOT}/tests/e2e" -p "test_*.py" -v

EXIT_CODE=$?

echo ""
echo "=============================================================================="
if [ ${EXIT_CODE} -eq 0 ]; then
  echo "✅ ALL E2E TEST TIERS COMPLETED SUCCESSFULLY (Exit Code 0)"
  echo "Tiers Covered: Tier 1 (Features), Tier 2 (Boundaries), Tier 3 (Cross), Tier 4 (Journeys)"
else
  echo "❌ TEST SUITE FAILED WITH EXIT CODE ${EXIT_CODE}"
fi
echo "=============================================================================="

exit ${EXIT_CODE}
