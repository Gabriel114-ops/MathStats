const STORAGE_KEY = "mathStatsOnePagePayload";
const DRAFT_KEY = "mathStatsOnePageDraft";

const entriesContainer = document.getElementById("entriesContainer");
const intervalInput = document.getElementById("intervalInput");
const interpolationToggle = document.getElementById("interpolationToggle");
const addBtn = document.getElementById("addBtn");
const clearBtn = document.getElementById("clearBtn");
const calculateBtn = document.getElementById("calculateBtn");
const scrollResultBtn = document.getElementById("scrollResultBtn");
const copySummaryBtn = document.getElementById("copySummaryBtn");
const replayTutorialBtn = document.getElementById("replayTutorialBtn");
const resultsPanel = document.getElementById("resultsPanel");
const processList = document.getElementById("processList");
const summaryGrid = document.getElementById("summaryGrid");
const fullTableBody = document.getElementById("fullTableBody");
const toggleTableBtn = document.getElementById("toggleTableBtn");
const fullTableWrap = document.getElementById("fullTableWrap");
const tutorialOverlay = document.getElementById("tutorialOverlay");
const tutorialTitle = document.getElementById("tutorialTitle");
const tutorialText = document.getElementById("tutorialText");
const tutorialNextBtn = document.getElementById("tutorialNextBtn");
const tutorialSkipBtn = document.getElementById("tutorialSkipBtn");
const tutorialCard = document.querySelector(".tutorial-card");

const meanValue = document.getElementById("meanValue");
const medianValue = document.getElementById("medianValue");
const modeValue = document.getElementById("modeValue");
const dispersionValue = document.getElementById("dispersionValue");

const tabButtons = [...document.querySelectorAll(".tab-btn")];
const TUTORIAL_DONE_KEY = "mathStatsOnePageTutorialDone";
let activeMetric = "mean";
let currentPayload = null;
let tutorialStepIndex = 0;

const tutorialSteps = [
    {
        title: "Step 1: Input Area",
        text: "Enter intervals, data, and frequencies here. The radial spotlight marks your working zone.",
        target: ".input-panel"
    },
    {
        title: "Step 2: Process Tabs",
        text: "After calculate, switch these tabs to inspect Mean, Median, Mode, and Variance/Std Dev steps.",
        target: ".process-box"
    },
    {
        title: "Step 3: Summary Values",
        text: "These compact cards show totals and final key answers for quick checking.",
        target: ".summary-grid"
    },
    {
        title: "Step 4: Full Table",
        text: "Scroll the complete table for full computation details. You can collapse and expand anytime.",
        target: ".table-panel"
    }
];

function formatNumber(value) {
    if (!Number.isFinite(value)) return "-";
    if (Number.isInteger(value)) return String(value);
    return Number(value.toFixed(4)).toString();
}

function escapeHtml(text) {
    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function clearTutorialFocus() {
    document.querySelectorAll(".tutorial-focus").forEach((el) => el.classList.remove("tutorial-focus"));
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function positionTutorialCard(targetRect) {
    if (!targetRect || !tutorialCard) return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const gap = 22;
    const minPad = 14;

    const preferredWidth = Math.min(470, Math.max(320, Math.floor(viewportWidth * 0.34)));
    tutorialCard.style.width = `${preferredWidth}px`;
    const cardRect = tutorialCard.getBoundingClientRect();

    let left = targetRect.right + gap;
    const top = clamp(targetRect.top + targetRect.height * 0.08, minPad, viewportHeight - cardRect.height - minPad);

    if (left + cardRect.width > viewportWidth - minPad) {
        left = targetRect.left - cardRect.width - gap;
    }
    if (left < minPad) {
        left = viewportWidth - cardRect.width - minPad;
    }
    left = clamp(left, minPad, viewportWidth - cardRect.width - minPad);

    tutorialOverlay.style.setProperty("--card-x", `${left}px`);
    tutorialOverlay.style.setProperty("--card-y", `${top}px`);
}

function setSpotlight(targetRect) {
    if (!targetRect) return;
    tutorialOverlay.style.setProperty("--spot-x", `${targetRect.left + targetRect.width / 2}px`);
    tutorialOverlay.style.setProperty("--spot-y", `${targetRect.top + targetRect.height / 2}px`);
    tutorialOverlay.style.setProperty("--spot-rx", `${Math.max(180, targetRect.width * 0.62)}px`);
    tutorialOverlay.style.setProperty("--spot-ry", `${Math.max(130, targetRect.height * 0.72)}px`);
}

function setTutorialStep(index) {
    const step = tutorialSteps[index];
    if (!step) return;
    tutorialStepIndex = index;
    clearTutorialFocus();
    tutorialTitle.textContent = step.title;
    tutorialText.textContent = step.text;
    const target = document.querySelector(step.target);
    if (target) {
        target.classList.add("tutorial-focus");
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        window.requestAnimationFrame(() => {
            const rect = target.getBoundingClientRect();
            setSpotlight(rect);
            positionTutorialCard(rect);
        });
    }
    tutorialNextBtn.textContent = index === tutorialSteps.length - 1 ? "Finish" : "Next";
}

function openTutorial(force = false) {
    const alreadyDone = localStorage.getItem(TUTORIAL_DONE_KEY) === "1";
    if (alreadyDone && !force) return;
    tutorialOverlay.classList.add("is-active");
    tutorialOverlay.setAttribute("aria-hidden", "false");
    setTutorialStep(0);
}

function closeTutorial(markDone = true) {
    tutorialOverlay.classList.remove("is-active");
    tutorialOverlay.setAttribute("aria-hidden", "true");
    clearTutorialFocus();
    if (markDone) {
        localStorage.setItem(TUTORIAL_DONE_KEY, "1");
    }
}

function createRow(data = "", frequency = "") {
    const tr = document.createElement("tr");
    tr.className = "input-row";
    tr.innerHTML = `
        <td><input class="data-input" type="text" inputmode="decimal" value="${escapeHtml(data)}" placeholder="e.g. 24"></td>
        <td><input class="freq-input" type="text" inputmode="numeric" value="${escapeHtml(frequency)}" placeholder="e.g. 3"></td>
        <td><button type="button" class="delete-btn">Delete</button></td>
    `;
    return tr;
}

function getRows() {
    return [...entriesContainer.querySelectorAll(".input-row")];
}

function ensureOneRow() {
    if (getRows().length > 0) return;
    entriesContainer.appendChild(createRow());
}

function clearValidationState() {
    getRows().forEach((row) => row.classList.remove("is-invalid"));
    intervalInput.classList.remove("is-invalid");
}

function markRowInvalid(row) {
    row.classList.add("is-invalid");
    row.scrollIntoView({ behavior: "smooth", block: "center" });
}

function saveDraft() {
    const draft = {
        interval: intervalInput.value,
        useInterpolation: interpolationToggle.checked,
        entries: getRows().map((row) => ({
            data: row.querySelector(".data-input").value,
            frequency: row.querySelector(".freq-input").value
        }))
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

function restoreDraft() {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) {
        ensureOneRow();
        return;
    }
    try {
        const draft = JSON.parse(raw);
        intervalInput.value = typeof draft.interval === "string" ? draft.interval : "";
        interpolationToggle.checked = Boolean(draft.useInterpolation);
        const entries = Array.isArray(draft.entries) && draft.entries.length
            ? draft.entries
            : [{ data: "", frequency: "" }];
        entriesContainer.innerHTML = "";
        for (const entry of entries) {
            entriesContainer.appendChild(createRow(entry.data || "", entry.frequency || ""));
        }
    } catch (error) {
        entriesContainer.innerHTML = "";
        ensureOneRow();
    }
}

function parseIntervalBounds(intervalText) {
    const match = intervalText.match(/(-?\d*\.?\d+)\s*-\s*(-?\d*\.?\d+)/);
    if (!match) return null;
    const lower = Number(match[1]);
    const upper = Number(match[2]);
    if (!Number.isFinite(lower) || !Number.isFinite(upper)) return null;
    const min = Math.min(lower, upper);
    const max = Math.max(lower, upper);
    return {
        lowerLimit: min,
        upperLimit: max,
        midpoint: (min + max) / 2,
        lowerBoundary: min - 0.5,
        upperBoundary: max + 0.5
    };
}

function buildTally(frequency) {
    if (frequency === 0) return "-";
    const groupsOfFive = Math.floor(frequency / 5);
    const remainder = frequency % 5;
    const parts = [];
    for (let i = 0; i < groupsOfFive; i += 1) parts.push("||||/");
    if (remainder > 0) parts.push("|".repeat(remainder));
    return parts.join(" ");
}

function findValueAtPosition(sortedPairs, position) {
    let running = 0;
    for (const pair of sortedPairs) {
        running += pair.frequency;
        if (running >= position) return pair.value;
    }
    return sortedPairs[sortedPairs.length - 1].value;
}

function buildPayload() {
    clearValidationState();
    const rows = getRows();
    const parsed = [];

    for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i];
        const dataValue = row.querySelector(".data-input").value.trim();
        const freqValue = row.querySelector(".freq-input").value.trim();
        if (!dataValue && !freqValue) continue;

        const x = Number(dataValue);
        const f = Number(freqValue);
        const isValid = Number.isFinite(x) && Number.isFinite(f) && f >= 0 && Number.isInteger(f);
        if (!isValid) {
            markRowInvalid(row);
            alert("Invalid values found. Use numeric data and whole-number non-negative frequency.");
            return null;
        }
        parsed.push({ x, f });
    }

    if (parsed.length === 0) {
        alert("Add at least one valid data and frequency pair.");
        return null;
    }

    const intervals = intervalInput.value
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);

    if (intervals.length > 0 && intervals.length !== parsed.length) {
        intervalInput.classList.add("is-invalid");
        intervalInput.scrollIntoView({ behavior: "smooth", block: "center" });
        alert("If intervals are provided, they must match the number of data/frequency rows.");
        return null;
    }

    const parsedIntervals = intervals.map(parseIntervalBounds);
    for (let i = 0; i < parsedIntervals.length; i += 1) {
        if (parsedIntervals[i] !== null) continue;
        intervalInput.classList.add("is-invalid");
        alert("Invalid interval format. Use format like 10-19.");
        return null;
    }

    const useInterpolation = interpolationToggle.checked && intervals.length > 0;
    const totalFrequency = parsed.reduce((sum, row) => sum + row.f, 0);
    if (totalFrequency === 0) {
        alert("Total frequency cannot be zero.");
        return null;
    }

    const tableRows = [];
    let cumulativeFrequency = 0;

    for (let i = 0; i < parsed.length; i += 1) {
        const row = parsed[i];
        const intervalBounds = intervals[i] ? parsedIntervals[i] : null;
        const midpoint = intervalBounds ? intervalBounds.midpoint : row.x;
        const lowerBoundary = intervalBounds ? intervalBounds.lowerBoundary : row.x - 0.5;
        const upperBoundary = intervalBounds ? intervalBounds.upperBoundary : row.x + 0.5;
        const fx = midpoint * row.f;

        cumulativeFrequency += row.f;
        tableRows.push({
            classInterval: intervals[i] || String(row.x),
            tally: buildTally(row.f),
            frequency: row.f,
            midpoint,
            classBoundaries: `${formatNumber(lowerBoundary)} - ${formatNumber(upperBoundary)}`,
            fx,
            cumulativeFrequency
        });
    }

    const sumFX = tableRows.reduce((sum, row) => sum + row.fx, 0);
    const mean = sumFX / totalFrequency;

    const sortedPairs = tableRows
        .map((row) => ({ value: row.midpoint, frequency: row.frequency }))
        .sort((a, b) => a.value - b.value);

    const isEven = totalFrequency % 2 === 0;
    const leftPosition = isEven ? totalFrequency / 2 : (totalFrequency + 1) / 2;
    const rightPosition = isEven ? leftPosition + 1 : leftPosition;
    const leftMedianValue = findValueAtPosition(sortedPairs, leftPosition);
    const rightMedianValue = findValueAtPosition(sortedPairs, rightPosition);

    let median = (leftMedianValue + rightMedianValue) / 2;
    let medianLowerBoundary = null;
    let medianClassFrequency = null;
    let medianCFPrev = null;
    let medianClassWidth = null;

    const maxFrequency = Math.max(...parsed.map((row) => row.f));
    let modeValues = sortedPairs
        .filter((pair) => pair.frequency === maxFrequency)
        .map((pair) => pair.value);
    let interpolatedModeDetails = [];

    if (useInterpolation) {
        const targetPosition = totalFrequency / 2;
        let runningFrequency = 0;
        for (let i = 0; i < parsed.length; i += 1) {
            const previous = runningFrequency;
            runningFrequency += parsed[i].f;
            if (runningFrequency < targetPosition) continue;
            medianCFPrev = previous;
            medianClassFrequency = parsed[i].f;
            medianLowerBoundary = parsedIntervals[i].lowerBoundary;
            medianClassWidth = parsedIntervals[i].upperBoundary - parsedIntervals[i].lowerBoundary;
            if (medianClassFrequency > 0) {
                median = medianLowerBoundary + ((targetPosition - medianCFPrev) / medianClassFrequency) * medianClassWidth;
            }
            break;
        }

        modeValues = parsed
            .map((row, index) => ({ frequency: row.f, index }))
            .filter((item) => item.frequency === maxFrequency)
            .map((item) => {
                const index = item.index;
                const f1 = parsed[index].f;
                const f0 = index > 0 ? parsed[index - 1].f : 0;
                const f2 = index < parsed.length - 1 ? parsed[index + 1].f : 0;
                const L = parsedIntervals[index].lowerBoundary;
                const h = parsedIntervals[index].upperBoundary - parsedIntervals[index].lowerBoundary;
                const denominator = 2 * f1 - f0 - f2;
                const value = denominator === 0
                    ? tableRows[index].midpoint
                    : L + ((f1 - f0) / denominator) * h;
                interpolatedModeDetails.push({ f0, f1, f2, L, h, denominator, value });
                return value;
            });
    }

    const squaredDeviationTerms = tableRows.map((row) => {
        const diff = row.midpoint - mean;
        return {
            midpoint: row.midpoint,
            frequency: row.frequency,
            weightedSquaredDiff: row.frequency * diff * diff
        };
    });
    const sumWeightedSquaredDiff = squaredDeviationTerms.reduce((sum, item) => sum + item.weightedSquaredDiff, 0);
    const variance = sumWeightedSquaredDiff / totalFrequency;
    const standardDeviation = Math.sqrt(variance);

    const sumFExpression = parsed.map((row) => row.f).join(" + ");
    const sumFXExpression = tableRows.map((row) => `(${formatNumber(row.midpoint)} × ${row.frequency})`).join(" + ");
    const modeExpression = modeValues.map((value) => formatNumber(value)).join(", ");
    const stdDevExpression = squaredDeviationTerms
        .map((term) => `${term.frequency}(${formatNumber(term.midpoint)} - ${formatNumber(mean)})²`)
        .join(" + ");

    const intro = `Given ${parsed.length} data point(s) with frequency values.`;
    const meanSteps = [
        intro,
        "Mean formula: Mean = Σfx / Σf",
        `Compute Σf: ${sumFExpression} = ${formatNumber(totalFrequency)}`,
        `Compute Σfx: ${sumFXExpression} = ${formatNumber(sumFX)}`,
        `Final Mean: ${formatNumber(sumFX)} / ${formatNumber(totalFrequency)} = ${formatNumber(mean)}`
    ];
    const medianSteps = [
        intro,
        useInterpolation
            ? "Median formula (interpolated grouped data): Median = L + ((N/2 - c.f.prev) / f) × h"
            : "Median formula (frequency data): locate middle position(s) in cumulative frequency.",
        useInterpolation
            ? `N = ${formatNumber(totalFrequency)}, L = ${formatNumber(medianLowerBoundary)}, c.f.prev = ${formatNumber(medianCFPrev)}, f = ${formatNumber(medianClassFrequency)}, h = ${formatNumber(medianClassWidth)}.`
            : `Total frequency N = ${formatNumber(totalFrequency)}; positions used: ${formatNumber(leftPosition)}${isEven ? ` and ${formatNumber(rightPosition)}` : ""}.`,
        useInterpolation
            ? `Median = ${formatNumber(median)}`
            : isEven
                ? `Median = (${formatNumber(leftMedianValue)} + ${formatNumber(rightMedianValue)}) / 2 = ${formatNumber(median)}`
                : `Median = value at position ${formatNumber(leftPosition)} = ${formatNumber(median)}`
    ];
    const modeSteps = [
        intro,
        useInterpolation
            ? "Mode formula (interpolated grouped data): Mode = L + ((f1 - f0) / (2f1 - f0 - f2)) × h"
            : "Mode formula: value(s) with highest frequency.",
        useInterpolation
            ? interpolatedModeDetails.length === 1
                ? `f0 = ${formatNumber(interpolatedModeDetails[0].f0)}, f1 = ${formatNumber(interpolatedModeDetails[0].f1)}, f2 = ${formatNumber(interpolatedModeDetails[0].f2)}, L = ${formatNumber(interpolatedModeDetails[0].L)}, h = ${formatNumber(interpolatedModeDetails[0].h)}.`
                : `Highest frequency class count = ${interpolatedModeDetails.length}. Interpolated each modal class using f0, f1, f2, L, and h.`
            : `Highest frequency = ${formatNumber(maxFrequency)}; Mode value(s) = ${modeExpression}.`,
        useInterpolation ? `Interpolated Mode value(s) = ${modeExpression}.` : undefined
    ].filter(Boolean);
    const dispersionSteps = [
        intro,
        "Standard deviation formula: σ = √( Σf(x - x̄)² / Σf )",
        `Compute Σf(x - x̄)²: ${stdDevExpression} = ${formatNumber(sumWeightedSquaredDiff)}`,
        `Variance: ${formatNumber(sumWeightedSquaredDiff)} / ${formatNumber(totalFrequency)} = ${formatNumber(variance)}`,
        `Standard Deviation: √${formatNumber(variance)} = ${formatNumber(standardDeviation)}`
    ];

    return {
        rows: tableRows,
        totals: {
            totalFrequency,
            sumFX,
            mean,
            median,
            modeValues,
            variance,
            standardDeviation
        },
        processByMetric: {
            mean: meanSteps,
            median: medianSteps,
            mode: modeSteps,
            dispersion: dispersionSteps
        },
        useInterpolation
    };
}

function renderProcess(metric) {
    const steps = currentPayload?.processByMetric?.[metric] || [];
    processList.classList.remove("process-slide");
    void processList.offsetWidth;
    processList.classList.add("process-slide");
    processList.innerHTML = steps.length
        ? steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")
        : "<li>No process data yet.</li>";
}

function renderSummary(payload) {
    const totals = payload?.totals;
    if (!totals) {
        summaryGrid.innerHTML = "";
        return;
    }
    const modeText = Array.isArray(totals.modeValues) && totals.modeValues.length
        ? totals.modeValues.map((value) => formatNumber(value)).join(", ")
        : "-";
    const items = [
        ["Σf", formatNumber(totals.totalFrequency)],
        ["Σfx", formatNumber(totals.sumFX)],
        ["Mean", formatNumber(totals.mean)],
        ["Median", formatNumber(totals.median)],
        ["Mode", modeText],
        ["Std Dev", formatNumber(totals.standardDeviation)]
    ];

    summaryGrid.innerHTML = items
        .map(([label, value]) => `
            <div class="summary-item">
                <span>${label}</span>
                <strong>${escapeHtml(value)}</strong>
            </div>
        `)
        .join("");
}

function renderTable(payload) {
    const rows = payload?.rows || [];
    const totals = payload?.totals;
    if (!rows.length || !totals) {
        fullTableBody.innerHTML = '<tr><td colspan="7" class="empty-cell">No computed data yet.</td></tr>';
        return;
    }

    let markup = rows.map((row) => `
        <tr>
            <td>${escapeHtml(row.classInterval)}</td>
            <td>${escapeHtml(row.tally)}</td>
            <td>${formatNumber(row.frequency)}</td>
            <td>${formatNumber(row.midpoint)}</td>
            <td>${escapeHtml(row.classBoundaries)}</td>
            <td>${formatNumber(row.fx)}</td>
            <td>${formatNumber(row.cumulativeFrequency)}</td>
        </tr>
    `).join("");

    markup += `
        <tr class="total-row">
            <td>Total</td>
            <td>-</td>
            <td>${formatNumber(totals.totalFrequency)}</td>
            <td>-</td>
            <td>-</td>
            <td>${formatNumber(totals.sumFX)}</td>
            <td>${formatNumber(totals.totalFrequency)}</td>
        </tr>
    `;
    fullTableBody.innerHTML = markup;
}

function renderCards(payload) {
    const totals = payload?.totals;
    if (!totals) {
        meanValue.textContent = "-";
        medianValue.textContent = "-";
        modeValue.textContent = "-";
        dispersionValue.textContent = "-";
        return;
    }
    meanValue.textContent = formatNumber(totals.mean);
    medianValue.textContent = formatNumber(totals.median);
    modeValue.textContent = totals.modeValues.length
        ? totals.modeValues.map((value) => formatNumber(value)).join(", ")
        : "-";
    dispersionValue.textContent = `${formatNumber(totals.variance)} / ${formatNumber(totals.standardDeviation)}`;
}

function renderPayload(payload) {
    currentPayload = payload;
    renderCards(payload);
    renderProcess(activeMetric);
    renderSummary(payload);
    renderTable(payload);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function restorePayload() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
        renderPayload(JSON.parse(raw));
    } catch (error) {
        localStorage.removeItem(STORAGE_KEY);
    }
}

addBtn.addEventListener("click", () => {
    const row = createRow();
    entriesContainer.appendChild(row);
    row.scrollIntoView({ behavior: "smooth", block: "center" });
    row.querySelector(".data-input").focus();
    saveDraft();
});

clearBtn.addEventListener("click", () => {
    intervalInput.value = "";
    interpolationToggle.checked = false;
    entriesContainer.innerHTML = "";
    ensureOneRow();
    clearValidationState();
    saveDraft();
});

entriesContainer.addEventListener("click", (event) => {
    if (!event.target.classList.contains("delete-btn")) return;
    const rows = getRows();
    if (rows.length === 1) {
        rows[0].querySelector(".data-input").value = "";
        rows[0].querySelector(".freq-input").value = "";
        saveDraft();
        return;
    }
    event.target.closest(".input-row").remove();
    saveDraft();
});

entriesContainer.addEventListener("keydown", (event) => {
    if (!event.target.classList.contains("freq-input") || event.key !== "Enter") return;
    event.preventDefault();
    const row = event.target.closest(".input-row");
    const rows = getRows();
    const isLast = rows.indexOf(row) === rows.length - 1;
    if (isLast) {
        addBtn.click();
        return;
    }
    rows[rows.indexOf(row) + 1].querySelector(".data-input").focus();
});

entriesContainer.addEventListener("input", (event) => {
    if (event.target.matches(".data-input, .freq-input")) {
        event.target.closest(".input-row").classList.remove("is-invalid");
        saveDraft();
    }
});

intervalInput.addEventListener("input", () => {
    intervalInput.classList.remove("is-invalid");
    saveDraft();
});
interpolationToggle.addEventListener("change", saveDraft);

calculateBtn.addEventListener("click", () => {
    const payload = buildPayload();
    if (!payload) return;
    renderPayload(payload);
    resultsPanel.classList.add("result-pulse");
    window.setTimeout(() => resultsPanel.classList.remove("result-pulse"), 650);
    resultsPanel.scrollIntoView({ behavior: "smooth", block: "start" });
});

scrollResultBtn.addEventListener("click", () => {
    resultsPanel.scrollIntoView({ behavior: "smooth", block: "start" });
});

copySummaryBtn.addEventListener("click", async () => {
    if (!currentPayload?.totals) {
        alert("No computed result to copy yet.");
        return;
    }
    const totals = currentPayload.totals;
    const modeText = totals.modeValues.length
        ? totals.modeValues.map((value) => formatNumber(value)).join(", ")
        : "-";
    const text = [
        "Math Stats Summary",
        `Mean: ${formatNumber(totals.mean)}`,
        `Median: ${formatNumber(totals.median)}`,
        `Mode: ${modeText}`,
        `Variance: ${formatNumber(totals.variance)}`,
        `Std Dev: ${formatNumber(totals.standardDeviation)}`
    ].join("\n");
    try {
        await navigator.clipboard.writeText(text);
        copySummaryBtn.textContent = "Copied!";
        window.setTimeout(() => {
            copySummaryBtn.textContent = "Copy Summary";
        }, 1100);
    } catch (error) {
        alert("Clipboard permission denied.");
    }
});

replayTutorialBtn.addEventListener("click", () => {
    openTutorial(true);
});

tutorialNextBtn.addEventListener("click", () => {
    if (tutorialStepIndex >= tutorialSteps.length - 1) {
        closeTutorial(true);
        return;
    }
    setTutorialStep(tutorialStepIndex + 1);
});

tutorialSkipBtn.addEventListener("click", () => {
    closeTutorial(true);
});

document.addEventListener("keydown", (event) => {
    if (!tutorialOverlay.classList.contains("is-active")) return;
    if (event.key === "Escape") {
        closeTutorial(true);
    }
});

window.addEventListener("resize", () => {
    if (!tutorialOverlay.classList.contains("is-active")) return;
    setTutorialStep(tutorialStepIndex);
});

tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
        tabButtons.forEach((item) => item.classList.remove("is-active"));
        button.classList.add("is-active");
        activeMetric = button.dataset.metric;
        renderProcess(activeMetric);
    });
});

toggleTableBtn.addEventListener("click", () => {
    fullTableWrap.classList.toggle("is-collapsed");
    toggleTableBtn.textContent = fullTableWrap.classList.contains("is-collapsed") ? "Expand" : "Collapse";
});

restoreDraft();
ensureOneRow();
saveDraft();
restorePayload();
openTutorial(false);
