package com.example.safemed

enum class Sex {
    Male,
    Female,
    Other,
}

enum class Severity {
    Danger,
    Warning,
    Info,
}

enum class RiskLevel(val label: String) {
    Safe("안전"),
    Caution("주의"),
    Danger("위험"),
}

data class Medicine(
    val id: String,
    val name: String,
    val ingredientName: String,
    val ingredientCode: String,
    val category: String,
    val company: String,
    val description: String,
)

data class UserProfile(
    val age: String = "",
    val sex: Sex = Sex.Other,
    val pregnant: Boolean = false,
)

data class RiskFinding(
    val id: String,
    val severity: Severity,
    val title: String,
    val medicines: List<Medicine>,
    val reason: String,
    val source: String,
    val profileRelated: Boolean = false,
)

data class SafeCombination(
    val id: String,
    val medicines: List<Medicine>,
    val summary: String,
)

data class ScoreBreakdown(
    val danger: Int,
    val warning: Int,
    val profile: Int,
    val info: Int,
)

data class AnalysisResult(
    val riskScore: Int,
    val riskLevel: RiskLevel,
    val findings: List<RiskFinding>,
    val safeCombinations: List<SafeCombination>,
    val scoreBreakdown: ScoreBreakdown,
    val summary: String,
)
