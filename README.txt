MathStats (Central Tendency Calculator)

Project Description
MathStats is a simple desktop app designed to compute mean, median, and mode instantly.
It also computes variance and standard deviation, and presents a clear computation flow for each metric.
The project is built for academic use in Probability and Statistics.

Course Information
Subject: Math 4 - Probability and Statistics
Section: BSCS-2
Instructor: Cleofe Calo

Group Information
Group Name: KuromiGeng²sters
Members:
- Lawrenz E. Mesiona
- Queenor Joy D. Zanoria
- Quinneth Brent Froxzel N. Valdueza
- Gabriel E. Bernardino

Key Features
- Computes Mean, Median, and Mode
- Computes Variance and Standard Deviation
- Accepts frequency-based input (data + frequency)
- Supports optional grouped intervals
- Generates a full table view (class interval, tally, frequency, midpoint, class boundaries, fx, cumulative frequency)
- Shows step-by-step solution process for major metrics
- Includes interactive UI with navigation between Welcome, Data Input, Results, and Table pages

How To Run (Recommended: EXE)
1. Open the distributed executable file (example: MathStats.exe).
2. Click Start Now on the welcome page.
3. Enter data values and corresponding frequencies.
4. (Optional) Enter class intervals separated by commas, aligned with each row.
5. Click Calculate to view results.
6. Open View Full Table for the detailed table output.
7. Use Back to Data Input to revise data and recompute.

How To Run (Source Code)
1. Install Python 3 on Windows.
2. Install dependencies:
   python -m pip install -r requirements.txt
3. Run the app:
   python app.py

Input Guide
- Data and Frequency are required for each valid row.
- Frequency must be a non-negative whole number.
- Interval format (optional): lower-upper
  Example: 0-9,10-19,20-29,30-39
- If intervals are used, the number of intervals must match the number of data/frequency rows.

Output Guide
- Mean: weighted average using frequency
- Median: center value (or interpolated value for grouped/interpolation mode)
- Mode: most frequent value(s) (or interpolated modal value for grouped/interpolation mode)
- Variance and Standard Deviation: measures of data spread
- Table Output: expanded calculation table for transparency and checking

Member Contributions
- Queenor Joy D. Zanoria: Theme selection and visual design direction.
- Gabriel E. Bernardino: Front-end implementation.
- Quinneth Brent Froxzel N. Valdueza: Back-end logic implementation.
- Lawrenz E. Mesiona: Semi full-stack coding, decision making, integration, and bug fixes.

Known Notes
- The distributed executable is intended for Windows.
- First launch may be slightly slower due to one-file EXE extraction behavior.
- Some web-hosted resources (if any) may depend on internet availability.

Future Improvements
- Add data import/export (CSV/Excel).
- Add chart visualizations for distribution and central tendency.
- Add more robust input validation messages and edge-case guides.
- Add downloadable/printable solution reports.

Version
Version: 1.0
Last Updated: 2026-03-25

License / Usage
This project is currently for Academic Use Only.
It may be released publicly in a future continuation of the project.
