package com.example.safemed

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder

private const val API_BASE_URL = "http://10.0.2.2:4000"

suspend fun searchMedicines(query: String): List<Medicine> = withContext(Dispatchers.IO) {
    val encodedQuery = URLEncoder.encode(query, Charsets.UTF_8.name())
    val response = requestJson("GET", "$API_BASE_URL/medicines?query=$encodedQuery")
    parseMedicineArray(JSONArray(response))
}

suspend fun analyzeMedicines(medicines: List<Medicine>, profile: UserProfile): AnalysisResult = withContext(Dispatchers.IO) {
    val payload = JSONObject()
        .put("medicines", JSONArray(medicines.map(::medicineToJson)))
        .put(
            "profile",
            JSONObject()
                .put("age", profile.age.toIntOrNull() ?: 0)
                .put("sex", profile.sex.toApiValue())
                .put("pregnant", profile.pregnant),
        )

    val response = requestJson("POST", "$API_BASE_URL/analyze", payload.toString())
    parseAnalysisResult(JSONObject(response))
}

private fun requestJson(method: String, url: String, body: String? = null): String {
    val connection = URL(url).openConnection() as HttpURLConnection
    connection.requestMethod = method
    connection.connectTimeout = 5_000
    connection.readTimeout = 5_000
    connection.setRequestProperty("Accept", "application/json")

    if (body != null) {
        connection.doOutput = true
        connection.setRequestProperty("Content-Type", "application/json; charset=utf-8")
        OutputStreamWriter(connection.outputStream, Charsets.UTF_8).use { writer ->
            writer.write(body)
        }
    }

    val statusCode = connection.responseCode
    val stream = if (statusCode in 200..299) connection.inputStream else connection.errorStream
    val response = stream.bufferedReader(Charsets.UTF_8).use { it.readText() }
    connection.disconnect()

    if (statusCode !in 200..299) {
        throw IllegalStateException("SafeMed API failed: $statusCode $response")
    }

    return response
}

private fun medicineToJson(medicine: Medicine): JSONObject =
    JSONObject()
        .put("id", medicine.id)
        .put("name", medicine.name)
        .put("ingredientName", medicine.ingredientName)
        .put("ingredientCode", medicine.ingredientCode)
        .put("category", medicine.category)
        .put("company", medicine.company)
        .put("description", medicine.description)

private fun parseAnalysisResult(json: JSONObject): AnalysisResult =
    AnalysisResult(
        riskScore = json.getInt("riskScore"),
        riskLevel = json.getString("riskLevel").toRiskLevel(),
        findings = parseFindingArray(json.getJSONArray("findings")),
        safeCombinations = parseSafeCombinationArray(json.getJSONArray("safeCombinations")),
        scoreBreakdown = parseScoreBreakdown(json.getJSONObject("scoreBreakdown")),
        summary = json.getString("summary"),
    )

private fun parseFindingArray(jsonArray: JSONArray): List<RiskFinding> =
    (0 until jsonArray.length()).map { index ->
        val json = jsonArray.getJSONObject(index)
        RiskFinding(
            id = json.getString("id"),
            severity = json.getString("severity").toSeverity(),
            title = json.getString("title"),
            medicines = parseMedicineArray(json.getJSONArray("medicines")),
            reason = json.getString("reason"),
            source = json.getString("source"),
            profileRelated = json.optBoolean("profileRelated", false),
        )
    }

private fun parseSafeCombinationArray(jsonArray: JSONArray): List<SafeCombination> =
    (0 until jsonArray.length()).map { index ->
        val json = jsonArray.getJSONObject(index)
        SafeCombination(
            id = json.getString("id"),
            medicines = parseMedicineArray(json.getJSONArray("medicines")),
            summary = json.getString("summary"),
        )
    }

private fun parseMedicineArray(jsonArray: JSONArray): List<Medicine> =
    (0 until jsonArray.length()).map { index ->
        val json = jsonArray.getJSONObject(index)
        Medicine(
            id = json.getString("id"),
            name = json.getString("name"),
            ingredientName = json.getString("ingredientName"),
            ingredientCode = json.getString("ingredientCode"),
            category = json.getString("category"),
            company = json.getString("company"),
            description = json.getString("description"),
        )
    }

private fun parseScoreBreakdown(json: JSONObject): ScoreBreakdown =
    ScoreBreakdown(
        danger = json.getInt("danger"),
        warning = json.getInt("warning"),
        profile = json.getInt("profile"),
        info = json.getInt("info"),
    )

private fun Sex.toApiValue(): String =
    when (this) {
        Sex.Male -> "male"
        Sex.Female -> "female"
        Sex.Other -> "other"
    }

private fun String.toSeverity(): Severity =
    when (this) {
        "danger" -> Severity.Danger
        "warning" -> Severity.Warning
        else -> Severity.Info
    }

private fun String.toRiskLevel(): RiskLevel =
    when (this) {
        "safe" -> RiskLevel.Safe
        "caution" -> RiskLevel.Caution
        else -> RiskLevel.Danger
    }
