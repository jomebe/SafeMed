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

val mockMedicines = listOf(
    Medicine(
        id = "amlodipine",
        name = "암로디핀",
        ingredientName = "Amlodipine",
        ingredientCode = "ING-AML-001",
        category = "혈압약",
        company = "세이프제약",
        description = "고혈압과 협심증 치료에 사용되는 칼슘채널차단제입니다.",
    ),
    Medicine(
        id = "metformin",
        name = "메트포르민",
        ingredientName = "Metformin",
        ingredientCode = "ING-MET-002",
        category = "당뇨약",
        company = "건강팜",
        description = "제2형 당뇨병에서 혈당 조절을 돕는 약입니다.",
    ),
    Medicine(
        id = "cimetidine",
        name = "시메티딘",
        ingredientName = "Cimetidine",
        ingredientCode = "ING-CIM-003",
        category = "위장약",
        company = "메디케어",
        description = "위산 분비를 줄이는 H2 수용체 길항제입니다.",
    ),
    Medicine(
        id = "ibuprofen",
        name = "이부프로펜",
        ingredientName = "Ibuprofen",
        ingredientCode = "ING-IBU-004",
        category = "소염진통제",
        company = "바른약품",
        description = "통증과 염증을 줄이는 비스테로이드성 소염진통제입니다.",
    ),
    Medicine(
        id = "acetaminophen",
        name = "아세트아미노펜",
        ingredientName = "Acetaminophen",
        ingredientCode = "ING-ACE-005",
        category = "해열진통제",
        company = "해피헬스",
        description = "발열과 통증 완화에 사용되는 해열진통제입니다.",
    ),
    Medicine(
        id = "codeine",
        name = "코데인",
        ingredientName = "Codeine",
        ingredientCode = "ING-COD-006",
        category = "진해진통제",
        company = "케어랩",
        description = "기침 억제와 통증 완화에 사용되는 성분입니다.",
    ),
    Medicine(
        id = "warfarin",
        name = "와파린",
        ingredientName = "Warfarin",
        ingredientCode = "ING-WAR-007",
        category = "항응고제",
        company = "라이프메드",
        description = "혈전 생성을 줄이기 위해 사용하는 항응고제입니다.",
    ),
    Medicine(
        id = "aspirin",
        name = "아스피린",
        ingredientName = "Aspirin",
        ingredientCode = "ING-ASP-008",
        category = "항혈소판제",
        company = "온누리제약",
        description = "통증 완화와 혈소판 응집 억제에 사용되는 약입니다.",
    ),
    Medicine(
        id = "rosuvastatin",
        name = "로수바스타틴",
        ingredientName = "Rosuvastatin",
        ingredientCode = "ING-ROS-009",
        category = "고지혈증약",
        company = "청솔제약",
        description = "콜레스테롤 수치를 낮추는 스타틴 계열 약입니다.",
    ),
    Medicine(
        id = "omeprazole",
        name = "오메프라졸",
        ingredientName = "Omeprazole",
        ingredientCode = "ING-OME-010",
        category = "위장약",
        company = "케이메디",
        description = "위산 분비를 억제하는 프로톤펌프억제제입니다.",
    ),
)

private data class PairRule(
    val medicineIds: Pair<String, String>,
    val severity: Severity,
    val reason: String,
    val source: String,
)

private val pairRules = listOf(
    PairRule(
        medicineIds = "cimetidine" to "metformin",
        severity = Severity.Danger,
        reason = "메트포르민 혈중 농도 상승 위험이 있어 주의가 필요합니다.",
        source = "DUR 병용금기 데이터",
    ),
    PairRule(
        medicineIds = "warfarin" to "aspirin",
        severity = Severity.Danger,
        reason = "출혈 위험이 증가할 수 있습니다.",
        source = "DUR 병용주의 데이터",
    ),
    PairRule(
        medicineIds = "ibuprofen" to "aspirin",
        severity = Severity.Warning,
        reason = "위장관 출혈 위험이 증가할 수 있습니다.",
        source = "노인주의 및 상호작용 데이터",
    ),
)

private val nsaidIds = setOf("ibuprofen", "aspirin")
private val pregnantCautionIds = setOf("codeine")

fun searchMedicines(query: String): List<Medicine> {
    val normalizedQuery = query.trim().lowercase()

    if (normalizedQuery.isEmpty()) {
        return mockMedicines
    }

    return mockMedicines.filter { medicine ->
        listOf(
            medicine.name,
            medicine.ingredientName,
            medicine.ingredientCode,
            medicine.category,
            medicine.company,
        ).joinToString(" ").lowercase().contains(normalizedQuery)
    }
}

fun analyzeMedicines(medicines: List<Medicine>, profile: UserProfile): AnalysisResult {
    val selectedIds = medicines.map { it.id }.toSet()
    val findings = mutableListOf<RiskFinding>()

    pairRules.forEach { rule ->
        val (firstId, secondId) = rule.medicineIds

        if (firstId in selectedIds && secondId in selectedIds) {
            val matchedMedicines = medicines.filter { it.id == firstId || it.id == secondId }

            findings += RiskFinding(
                id = "$firstId-$secondId",
                severity = rule.severity,
                title = if (rule.severity == Severity.Danger) {
                    "즉시 확인이 필요한 조합"
                } else {
                    "주의가 필요한 조합"
                },
                medicines = matchedMedicines,
                reason = rule.reason,
                source = rule.source,
            )
        }
    }

    if (profile.pregnant && "codeine" in selectedIds) {
        findings += RiskFinding(
            id = "pregnant-codeine",
            severity = Severity.Danger,
            title = "임부 주의 성분",
            medicines = medicines.filter { it.id == "codeine" },
            reason = "임부에게 주의가 필요한 성분입니다.",
            source = "임부금기 데이터",
            profileRelated = true,
        )
    }

    val ageNumber = profile.age.toIntOrNull() ?: 0

    if (ageNumber >= 65 && "ibuprofen" in selectedIds) {
        findings += RiskFinding(
            id = "senior-ibuprofen",
            severity = Severity.Warning,
            title = "고령자 주의 성분",
            medicines = medicines.filter { it.id == "ibuprofen" },
            reason = "고령자에게 위장관 출혈 위험이 증가할 수 있습니다.",
            source = "노인주의약물 데이터",
            profileRelated = true,
        )
    }

    if (medicines.size >= 4) {
        findings += RiskFinding(
            id = "polypharmacy-info",
            severity = Severity.Info,
            title = "다중 약물 복용 참고",
            medicines = medicines,
            reason = "선택한 약물이 4개 이상입니다. 복용 시간과 중복 성분을 함께 확인하면 좋습니다.",
            source = "SafeMed 데모 참고 신호",
        )
    }

    val scoreBreakdown = getScoreBreakdown(findings, medicines, profile)
    val rawScore = scoreBreakdown.danger + scoreBreakdown.warning + scoreBreakdown.profile + scoreBreakdown.info
    val riskScore = rawScore.coerceAtMost(100)
    val riskLevel = getRiskLevel(riskScore)

    return AnalysisResult(
        riskScore = riskScore,
        riskLevel = riskLevel,
        findings = findings,
        safeCombinations = getSafeCombinations(medicines, findings),
        scoreBreakdown = scoreBreakdown,
        summary = getSummary(findings, riskLevel),
    )
}

private fun getScoreBreakdown(
    findings: List<RiskFinding>,
    medicines: List<Medicine>,
    profile: UserProfile,
): ScoreBreakdown {
    val danger = findings.count { it.severity == Severity.Danger } * 35
    val warning = findings.count { it.severity == Severity.Warning } * 18
    val info = findings.count { it.severity == Severity.Info } * 7
    val selectedIds = medicines.map { it.id }.toSet()
    val hasNsaid = medicines.any { it.id in nsaidIds }
    var profileScore = 0

    if ((profile.age.toIntOrNull() ?: 0) >= 65 && hasNsaid) {
        profileScore += 5
    }

    if (profile.pregnant && pregnantCautionIds.any { it in selectedIds }) {
        profileScore += 15
    }

    return ScoreBreakdown(
        danger = danger,
        warning = warning,
        profile = profileScore,
        info = info,
    )
}

private fun getSafeCombinations(
    medicines: List<Medicine>,
    findings: List<RiskFinding>,
): List<SafeCombination> {
    val riskyPairKeys = findings
        .filter { it.medicines.size >= 2 }
        .map { makePairKey(it.medicines.map { medicine -> medicine.id }) }
        .toSet()

    return buildList {
        medicines.forEachIndexed { firstIndex, firstMedicine ->
            medicines.drop(firstIndex + 1).forEach { secondMedicine ->
                val pairKey = makePairKey(listOf(firstMedicine.id, secondMedicine.id))

                if (pairKey !in riskyPairKeys) {
                    add(
                        SafeCombination(
                            id = pairKey,
                            medicines = listOf(firstMedicine, secondMedicine),
                            summary = "현재 목 데이터 기준으로 별도 위험 신호가 확인되지 않았습니다.",
                        ),
                    )
                }
            }
        }
    }
}

private fun makePairKey(ids: List<String>): String =
    ids.sorted().joinToString("__")

private fun getRiskLevel(score: Int): RiskLevel =
    when {
        score <= 30 -> RiskLevel.Safe
        score <= 60 -> RiskLevel.Caution
        else -> RiskLevel.Danger
    }

private fun getSummary(findings: List<RiskFinding>, riskLevel: RiskLevel): String {
    val firstDanger = findings.firstOrNull { it.severity == Severity.Danger }

    if (firstDanger != null) {
        val names = firstDanger.medicines.joinToString("과 ") { it.name }
        return "현재 선택한 약 중 일부는 함께 복용할 때 위험할 수 있어요. 특히 ${names} 조합은 전문가 상담이 필요해요."
    }

    if (riskLevel == RiskLevel.Caution) {
        return "현재 선택한 약에서 주의가 필요한 신호가 있어요. 복용 전 의사나 약사에게 확인해 주세요."
    }

    return "현재 목 데이터 기준으로 큰 위험 신호는 확인되지 않았어요. 그래도 복약 결정은 전문가와 상담해 주세요."
}
