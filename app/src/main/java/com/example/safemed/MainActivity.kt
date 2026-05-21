package com.example.safemed

import android.os.Bundle
import android.speech.tts.TextToSpeech
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.LocalTextStyle
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TextField
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.util.Locale

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            MaterialTheme {
                CompositionLocalProvider(
                    LocalTextStyle provides LocalTextStyle.current.copy(fontFamily = Pretendard),
                ) {
                    SafeMedApp()
                }
            }
        }
    }
}

private val Pretendard = FontFamily(
    Font(R.font.pretendard_regular, FontWeight.Normal),
    Font(R.font.pretendard_semibold, FontWeight.SemiBold),
    Font(R.font.pretendard_bold, FontWeight.Bold),
    Font(R.font.pretendard_extrabold, FontWeight.ExtraBold),
    Font(R.font.pretendard_black, FontWeight.Black),
)

@Composable
private fun SafeMedApp() {
    var selectedMedicines by remember { mutableStateOf<List<Medicine>>(emptyList()) }
    var profile by remember { mutableStateOf(UserProfile()) }
    var result by remember { mutableStateOf<AnalysisResult?>(null) }
    var loading by remember { mutableStateOf(false) }
    var showSplash by remember { mutableStateOf(true) }
    var largeText by remember { mutableStateOf(false) }
    var highContrast by remember { mutableStateOf(false) }
    var apiError by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()
    val colors = remember(highContrast) { SafeMedPalette(highContrast) }
    val textScale = if (largeText) 1.12f else 1f

    LaunchedEffect(Unit) {
        delay(800)
        showSplash = false
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(colors.root),
        contentAlignment = Alignment.Center,
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .widthIn(max = 393.dp)
                .background(colors.page),
        ) {
            when {
                showSplash -> SplashScreen(colors, textScale)
                loading -> LoadingScreen(colors, textScale)
                result != null -> ResultDashboard(
                    result = result!!,
                    selectedMedicines = selectedMedicines,
                    colors = colors,
                    textScale = textScale,
                    onReset = { result = null },
                )
                else -> InputScreen(
                    selectedMedicines = selectedMedicines,
                    profile = profile,
                    errorMessage = apiError,
                    colors = colors,
                    textScale = textScale,
                    onSelect = { medicine ->
                        if (selectedMedicines.none { it.id == medicine.id }) {
                            selectedMedicines = selectedMedicines + medicine
                            result = null
                        }
                    },
                    onRemove = { medicineId ->
                        selectedMedicines = selectedMedicines.filterNot { it.id == medicineId }
                        result = null
                    },
                    onProfileChange = {
                        profile = it
                        result = null
                        apiError = null
                    },
                    onLoadSample = {
                        scope.launch {
                            val sampleNames = setOf("암로디핀", "메트포르민", "시메티딘", "이부프로펜")
                            loading = true
                            result = null
                            apiError = null

                            try {
                                selectedMedicines = searchMedicines("").filter { it.name in sampleNames }
                            } catch (_: Exception) {
                                apiError = "백엔드에 연결할 수 없습니다. 서버를 먼저 실행해 주세요."
                            } finally {
                                loading = false
                            }
                        }
                    },
                    onAnalyze = {
                        if (selectedMedicines.size < 2 || loading) return@InputScreen

                        scope.launch {
                            loading = true
                            result = null
                            apiError = null

                            try {
                                result = analyzeMedicines(selectedMedicines, profile)
                            } catch (_: Exception) {
                                apiError = "분석 요청에 실패했습니다. 백엔드 서버를 확인해 주세요."
                            } finally {
                                loading = false
                            }
                        }
                    },
                )
            }

            if (!showSplash && !loading && result == null) {
                AccessibilityControls(
                    largeText = largeText,
                    highContrast = highContrast,
                    colors = colors,
                    textScale = textScale,
                    onLargeTextChange = { largeText = !largeText },
                    onHighContrastChange = { highContrast = !highContrast },
                    onReset = {
                        largeText = false
                        highContrast = false
                    },
                    modifier = Modifier
                        .align(Alignment.BottomEnd)
                        .padding(16.dp),
                )
            }
        }
    }
}

@Composable
private fun SplashScreen(colors: SafeMedPalette, textScale: Float) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(colors.page),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = "SafeMed",
            color = colors.orange,
            fontSize = scaledSp(36, textScale),
            fontWeight = FontWeight.Black,
        )
    }
}

@Composable
private fun LoadingScreen(colors: SafeMedPalette, textScale: Float) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(colors.page),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        CircularProgressIndicator(
            color = colors.muted,
            strokeWidth = 3.dp,
            modifier = Modifier.size(32.dp),
        )
        Spacer(Modifier.height(32.dp))
        Text(
            text = "분석중..",
            color = colors.muted,
            fontSize = scaledSp(24, textScale),
            fontWeight = FontWeight.Black,
        )
    }
}

@Composable
private fun InputScreen(
    selectedMedicines: List<Medicine>,
    profile: UserProfile,
    errorMessage: String?,
    colors: SafeMedPalette,
    textScale: Float,
    onSelect: (Medicine) -> Unit,
    onRemove: (String) -> Unit,
    onProfileChange: (UserProfile) -> Unit,
    onLoadSample: () -> Unit,
    onAnalyze: () -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(colors.page)
            .verticalScroll(rememberScrollState())
            .padding(start = 29.dp, top = 56.dp, end = 29.dp, bottom = 96.dp),
    ) {
        Text(
            text = "SafeMed",
            modifier = Modifier.fillMaxWidth(),
            textAlign = TextAlign.Center,
            color = colors.orange,
            fontSize = scaledSp(30, textScale),
            fontWeight = FontWeight.Black,
        )

        Spacer(Modifier.height(32.dp))
        MedicineSearch(
            selectedMedicines = selectedMedicines,
            colors = colors,
            textScale = textScale,
            onSelect = onSelect,
            onLoadSample = onLoadSample,
        )
        Spacer(Modifier.height(24.dp))
        SelectedMedicineList(
            medicines = selectedMedicines,
            colors = colors,
            textScale = textScale,
            onRemove = onRemove,
        )
        Spacer(Modifier.height(24.dp))
        ProfileForm(
            profile = profile,
            colors = colors,
            textScale = textScale,
            onChange = onProfileChange,
        )
        Spacer(Modifier.height(40.dp))
        if (errorMessage != null) {
            Text(
                text = errorMessage,
                modifier = Modifier.fillMaxWidth(),
                color = colors.orange,
                fontSize = scaledSp(12, textScale),
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center,
            )
            Spacer(Modifier.height(12.dp))
        }
        AnalyzeButton(
            enabled = selectedMedicines.size >= 2,
            colors = colors,
            textScale = textScale,
            onClick = onAnalyze,
        )
        Spacer(Modifier.height(16.dp))
        Text(
            text = "본 서비스는 의학적 진단이나 처방을 대체하지 않습니다. 복약 관련 결정은 반드시 의사·약사와 상담하세요.",
            modifier = Modifier.fillMaxWidth(),
            textAlign = TextAlign.Center,
            color = colors.muted,
            fontSize = scaledSp(11, textScale),
            fontWeight = FontWeight.SemiBold,
            lineHeight = scaledSp(20, textScale),
        )
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun MedicineSearch(
    selectedMedicines: List<Medicine>,
    colors: SafeMedPalette,
    textScale: Float,
    onSelect: (Medicine) -> Unit,
    onLoadSample: () -> Unit,
) {
    var query by remember { mutableStateOf("") }
    var results by remember { mutableStateOf<List<Medicine>>(emptyList()) }
    var searchFailed by remember { mutableStateOf(false) }
    val selectedIds = selectedMedicines.map { it.id }.toSet()

    LaunchedEffect(query) {
        try {
            val allResults = searchMedicines(query)
            results = if (query.trim().isEmpty()) allResults.take(3) else allResults.take(8)
            searchFailed = false
        } catch (_: Exception) {
            results = emptyList()
            searchFailed = true
        }
    }

    Column {
        SectionLabel("약정보", colors, textScale)
        Spacer(Modifier.height(12.dp))
        TextField(
            value = query,
            onValueChange = { query = it },
            placeholder = {
                Text(
                    text = "약 이름을 입력해주세요.",
                    color = colors.muted,
                    fontSize = scaledSp(14, textScale),
                    fontWeight = FontWeight.SemiBold,
                )
            },
            trailingIcon = {
                Text(
                    text = "검색",
                    color = colors.muted,
                    fontSize = scaledSp(12, textScale),
                    fontWeight = FontWeight.Black,
                )
            },
            singleLine = true,
            shape = RoundedCornerShape(12.dp),
            colors = TextFieldDefaults.colors(
                focusedContainerColor = colors.page,
                unfocusedContainerColor = colors.surface,
                disabledContainerColor = colors.surface,
                focusedIndicatorColor = Color.Transparent,
                unfocusedIndicatorColor = Color.Transparent,
                cursorColor = colors.orange,
                focusedTextColor = colors.ink,
                unfocusedTextColor = colors.ink,
            ),
            modifier = Modifier.fillMaxWidth(),
        )
        Spacer(Modifier.height(16.dp))
        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            results.forEach { medicine ->
                val selected = medicine.id in selectedIds
                MedicineChip(
                    text = medicine.name,
                    selected = selected,
                    colors = colors,
                    textScale = textScale,
                    onClick = { if (!selected) onSelect(medicine) },
                )
            }
        }
        if (searchFailed) {
            Spacer(Modifier.height(8.dp))
            Text(
                text = "백엔드 연결 실패",
                color = colors.orange,
                fontSize = scaledSp(12, textScale),
                fontWeight = FontWeight.Bold,
            )
        }
        Spacer(Modifier.height(16.dp))
        Button(
            onClick = onLoadSample,
            shape = RoundedCornerShape(12.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = colors.orangeSoft,
                contentColor = colors.orange,
            ),
            border = BorderStroke(1.dp, colors.orange),
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text(
                text = "예시 약물 불러오기",
                fontSize = scaledSp(14, textScale),
                fontWeight = FontWeight.ExtraBold,
                modifier = Modifier.padding(vertical = 6.dp),
            )
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun SelectedMedicineList(
    medicines: List<Medicine>,
    colors: SafeMedPalette,
    textScale: Float,
    onRemove: (String) -> Unit,
) {
    if (medicines.isEmpty()) {
        Surface(
            color = colors.surface,
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text(
                text = "선택된 약이 없습니다. 두 가지 이상 선택하면 분석할 수 있습니다.",
                color = colors.muted,
                fontSize = scaledSp(12, textScale),
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.padding(16.dp),
            )
        }
        return
    }

    Column {
        SectionLabel("선택된 약정보", colors, textScale)
        Spacer(Modifier.height(12.dp))
        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            medicines.forEach { medicine ->
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = colors.surface,
                    border = BorderStroke(1.dp, colors.line),
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                    ) {
                        Text(
                            text = medicine.name,
                            color = colors.muted,
                            fontSize = scaledSp(12, textScale),
                            fontWeight = FontWeight.SemiBold,
                        )
                        Spacer(Modifier.width(8.dp))
                        Text(
                            text = "X",
                            color = colors.muted,
                            fontSize = scaledSp(14, textScale),
                            fontWeight = FontWeight.Black,
                            modifier = Modifier.clickable { onRemove(medicine.id) },
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun ProfileForm(
    profile: UserProfile,
    colors: SafeMedPalette,
    textScale: Float,
    onChange: (UserProfile) -> Unit,
) {
    Column {
        SectionLabel("성별", colors, textScale)
        Spacer(Modifier.height(12.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
            SexButton(
                text = "남성",
                selected = profile.sex == Sex.Male,
                colors = colors,
                textScale = textScale,
                modifier = Modifier.weight(1f),
                onClick = { onChange(profile.copy(sex = Sex.Male)) },
            )
            SexButton(
                text = "여성",
                selected = profile.sex == Sex.Female,
                colors = colors,
                textScale = textScale,
                modifier = Modifier.weight(1f),
                onClick = { onChange(profile.copy(sex = Sex.Female)) },
            )
        }
        Spacer(Modifier.height(8.dp))
        SexButton(
            text = "기타 / 선택 안 함",
            selected = profile.sex == Sex.Other,
            colors = colors,
            textScale = textScale,
            modifier = Modifier.fillMaxWidth(),
            onClick = { onChange(profile.copy(sex = Sex.Other)) },
        )
        Spacer(Modifier.height(24.dp))
        SectionLabel("나이", colors, textScale)
        Spacer(Modifier.height(12.dp))
        TextField(
            value = profile.age,
            onValueChange = { value ->
                if (value.all { it.isDigit() } && value.length <= 3) {
                    onChange(profile.copy(age = value))
                }
            },
            placeholder = {
                Text(
                    text = "나이를 입력해주세요.",
                    color = colors.muted,
                    fontSize = scaledSp(14, textScale),
                    fontWeight = FontWeight.SemiBold,
                )
            },
            singleLine = true,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            shape = RoundedCornerShape(12.dp),
            colors = TextFieldDefaults.colors(
                focusedContainerColor = colors.page,
                unfocusedContainerColor = colors.surface,
                disabledContainerColor = colors.surface,
                focusedIndicatorColor = Color.Transparent,
                unfocusedIndicatorColor = Color.Transparent,
                cursorColor = colors.orange,
                focusedTextColor = colors.ink,
                unfocusedTextColor = colors.ink,
            ),
            modifier = Modifier.fillMaxWidth(),
        )
        Spacer(Modifier.height(24.dp))
        SectionLabel("임산부", colors, textScale)
        Spacer(Modifier.height(12.dp))
        Button(
            onClick = { onChange(profile.copy(pregnant = !profile.pregnant)) },
            shape = RoundedCornerShape(12.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = if (profile.pregnant) colors.orange else colors.surface,
                contentColor = if (profile.pregnant) Color.White else colors.muted,
            ),
            modifier = Modifier.width(165.dp),
        ) {
            Text(
                text = if (profile.pregnant) "임산부입니다." else "해당 없음",
                fontSize = scaledSp(14, textScale),
                fontWeight = FontWeight.ExtraBold,
                modifier = Modifier.padding(vertical = 8.dp),
            )
        }
        Spacer(Modifier.height(12.dp))
        Text(
            text = "개인 특성에 따라 금기·주의 여부가 달라질 수 있습니다.",
            color = colors.muted,
            fontSize = scaledSp(14, textScale),
            lineHeight = scaledSp(24, textScale),
        )
    }
}

@Composable
private fun ResultDashboard(
    result: AnalysisResult,
    selectedMedicines: List<Medicine>,
    colors: SafeMedPalette,
    textScale: Float,
    onReset: () -> Unit,
) {
    val dangerCount = result.findings.count { it.severity == Severity.Danger }
    val warningCount = result.findings.count { it.severity == Severity.Warning }
    val dangerFindings = result.findings.filter { it.severity == Severity.Danger }
    val warningFindings = result.findings.filter { it.severity == Severity.Warning }
    val infoFindings = result.findings.filter { it.severity == Severity.Info }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(colors.page)
            .verticalScroll(rememberScrollState())
            .padding(start = 29.dp, top = 110.dp, end = 29.dp, bottom = 32.dp),
    ) {
        SectionLabel("선택된 약정보", colors, textScale)
        Spacer(Modifier.height(12.dp))
        FigmaMedicineChips(selectedMedicines, colors, textScale)
        Spacer(Modifier.height(14.dp))
        DividerLine(colors)
        Spacer(Modifier.height(39.dp))
        FigmaScoreBar(
            score = result.riskScore,
            warningCount = warningCount,
            safeCount = result.safeCombinations.size,
            colors = colors,
            textScale = textScale,
        )
        Spacer(Modifier.height(25.dp))
        FigmaFindingGroup("즉시확인이 필요한 조합", dangerCount, Tone.Danger, dangerFindings, colors, textScale)
        Spacer(Modifier.height(31.dp))
        FigmaFindingGroup("주의가 필요한 조합", warningCount, Tone.Warning, warningFindings, colors, textScale)
        Spacer(Modifier.height(31.dp))
        FigmaFindingGroup("안전 조합", result.safeCombinations.size, Tone.Safe, infoFindings, colors, textScale)
        Spacer(Modifier.height(14.dp))
        DividerLine(colors)
        Spacer(Modifier.height(40.dp))
        selectedMedicines.take(2).forEachIndexed { index, medicine ->
            FigmaDrugDetailCard(medicine, colors, textScale)
            Spacer(Modifier.height(if (index == 0) 61.dp else 20.dp))
            DividerLine(colors)
            Spacer(Modifier.height(40.dp))
        }
        TextButton(onClick = onReset, modifier = Modifier.fillMaxWidth()) {
            Text("다시 분석하기", color = colors.orange, fontSize = scaledSp(14, textScale), fontWeight = FontWeight.Black)
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun FigmaMedicineChips(medicines: List<Medicine>, colors: SafeMedPalette, textScale: Float) {
    FlowRow(horizontalArrangement = Arrangement.spacedBy(5.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        medicines.forEachIndexed { index, medicine ->
            Surface(
                color = if (index == 2) colors.orangeSoft else colors.surface,
                shape = RoundedCornerShape(5.dp),
                border = if (index == 2) BorderStroke(1.dp, colors.orange) else null,
            ) {
                Text(
                    text = medicine.name,
                    color = if (index == 2) colors.ink else colors.muted,
                    fontSize = scaledSp(12, textScale),
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.padding(horizontal = 11.dp, vertical = 7.dp),
                )
            }
        }
    }
}

@Composable
private fun FigmaScoreBar(
    score: Int,
    warningCount: Int,
    safeCount: Int,
    colors: SafeMedPalette,
    textScale: Float,
) {
    Column {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = "위험지수",
                color = colors.ink,
                fontSize = scaledSp(16, textScale),
                fontWeight = FontWeight.SemiBold,
            )
            Text(
                text = "$score/100",
                color = colors.orange,
                fontSize = scaledSp(20, textScale),
                fontWeight = FontWeight.Black,
            )
        }
        Spacer(Modifier.height(24.dp))
        Surface(color = colors.surface, shape = RoundedCornerShape(5.dp), modifier = Modifier.fillMaxWidth()) {
            Row(
                modifier = Modifier
                    .height(58.dp)
                    .padding(horizontal = 14.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                FigmaSegmentLabel("안전", colors, textScale, Modifier.weight(1f))
                FigmaVerticalRule(colors)
                FigmaSegmentLabel("주의요함", colors, textScale, Modifier.weight(1f))
                FigmaVerticalRule(colors)
                FigmaSegmentLabel("위험", colors, textScale, Modifier.weight(1f))
            }
        }
    }
}

@Composable
private fun FigmaSegmentLabel(
    label: String,
    colors: SafeMedPalette,
    textScale: Float,
    modifier: Modifier = Modifier,
) {
    Text(
        text = label,
        color = if (label == "위험") colors.ink else colors.muted,
        fontSize = scaledSp(17, textScale),
        fontWeight = FontWeight.SemiBold,
        textAlign = TextAlign.Center,
        modifier = modifier,
    )
}

@Composable
private fun FigmaVerticalRule(colors: SafeMedPalette) {
    Box(
        modifier = Modifier
            .width(1.dp)
            .height(26.dp)
            .background(colors.muted),
    )
}

@Composable
private fun FigmaFindingGroup(
    title: String,
    count: Int,
    tone: Tone,
    findings: List<RiskFinding>,
    colors: SafeMedPalette,
    textScale: Float,
) {
    Column {
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Text(title, color = colors.ink, fontSize = scaledSp(15, textScale), fontWeight = FontWeight.Black)
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(tone.color(colors)))
                Spacer(Modifier.width(10.dp))
                Text("${toneLabel(tone)} $count", color = colors.muted, fontSize = scaledSp(10, textScale), fontWeight = FontWeight.SemiBold)
            }
        }
        Spacer(Modifier.height(12.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(5.dp), modifier = Modifier.fillMaxWidth()) {
            FigmaMiniBox(if (findings.isNotEmpty()) findings.first().medicines.getOrNull(0)?.name ?: "해당 없음" else "해당 없음", colors, textScale, Modifier.weight(1f))
            FigmaMiniBox(if (findings.isNotEmpty()) findings.first().medicines.getOrNull(1)?.name ?: "상세 확인" else "상세 확인", colors, textScale, Modifier.weight(1f))
        }
        Spacer(Modifier.height(14.dp))
        val visibleFindings = if (findings.isEmpty()) emptyList() else findings.take(2)
        if (visibleFindings.isEmpty()) {
            FigmaFindingLine(tone, "현재 백엔드 기준으로 별도 위험 신호가 확인되지 않았습니다.", colors, textScale)
            FigmaFindingLine(Tone.Info, "복용 전 의사·약사와 상담하면 더 안전합니다.", colors, textScale)
        } else {
            visibleFindings.forEach { finding ->
                FigmaFindingLine(tone, "${finding.title} - ${finding.reason}", colors, textScale)
            }
            if (visibleFindings.size == 1) {
                FigmaFindingLine(Tone.Info, "출처: ${visibleFindings.first().source}", colors, textScale)
            }
        }
    }
}

@Composable
private fun FigmaMiniBox(text: String, colors: SafeMedPalette, textScale: Float, modifier: Modifier = Modifier) {
    Surface(color = colors.surface, shape = RoundedCornerShape(5.dp), modifier = modifier.height(40.dp)) {
        Box(contentAlignment = Alignment.Center) {
            Text(text, color = colors.muted, fontSize = scaledSp(12, textScale), fontWeight = FontWeight.SemiBold, textAlign = TextAlign.Center)
        }
    }
}

@Composable
private fun FigmaFindingLine(tone: Tone, text: String, colors: SafeMedPalette, textScale: Float) {
    Row(modifier = Modifier.padding(top = 10.dp), verticalAlignment = Alignment.Top) {
        Box(
            modifier = Modifier
                .size(15.dp)
                .clip(CircleShape)
                .background(tone.color(colors)),
            contentAlignment = Alignment.Center,
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Box(
                    modifier = Modifier
                        .width(2.dp)
                        .height(6.dp)
                        .clip(RoundedCornerShape(999.dp))
                        .background(Color.White),
                )
                Spacer(Modifier.height(1.dp))
                Box(
                    modifier = Modifier
                        .size(2.dp)
                        .clip(CircleShape)
                        .background(Color.White),
                )
            }
        }
        Spacer(Modifier.width(6.dp))
        Text(text, color = colors.muted, fontSize = scaledSp(12, textScale), lineHeight = scaledSp(18, textScale), modifier = Modifier.weight(1f))
    }
}

@Composable
private fun FigmaDrugDetailCard(medicine: Medicine, colors: SafeMedPalette, textScale: Float) {
    Row(horizontalArrangement = Arrangement.spacedBy(6.dp), modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.weight(1f)) {
            Text("약별 상세 정보", color = colors.orange, fontSize = scaledSp(14, textScale), fontWeight = FontWeight.Black)
            Spacer(Modifier.height(12.dp))
            Text(medicine.name, color = colors.ink, fontSize = scaledSp(14, textScale), fontWeight = FontWeight.Black)
            Spacer(Modifier.height(10.dp))
            DetailLine("성분", "${medicine.ingredientName} · ${medicine.ingredientCode}", colors, textScale)
            DetailLine("정보", medicine.description, colors, textScale)
            DetailLine("제조사", medicine.company, colors, textScale)
        }
        Surface(color = colors.surface, shape = RoundedCornerShape(5.dp), modifier = Modifier.size(width = 165.dp, height = 146.dp)) {
            Box(contentAlignment = Alignment.Center) {
                Text(medicine.category, color = colors.muted, fontSize = scaledSp(14, textScale), fontWeight = FontWeight.Bold)
            }
        }
    }
}

private fun toneLabel(tone: Tone): String =
    when (tone) {
        Tone.Danger -> "위험"
        Tone.Warning -> "주의"
        Tone.Safe -> "안전"
        else -> "참고"
    }

@Composable
private fun RiskGauge(score: Int, level: RiskLevel, colors: SafeMedPalette, textScale: Float) {
    val toneColor = level.toneColor(colors)

    Column(modifier = Modifier.fillMaxWidth()) {
        DividerLine(colors)
        Spacer(Modifier.height(12.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.Bottom,
        ) {
            Column {
                SectionLabel("위험지수", colors, textScale)
                Spacer(Modifier.height(8.dp))
                Text(
                    text = level.label,
                    color = colors.muted,
                    fontSize = scaledSp(14, textScale),
                    fontWeight = FontWeight.Bold,
                )
            }
            Text(
                text = "$score/100",
                color = toneColor,
                fontSize = scaledSp(24, textScale),
                fontWeight = FontWeight.Black,
            )
        }
        Spacer(Modifier.height(16.dp))
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(12.dp)
                .clip(RoundedCornerShape(999.dp))
                .background(colors.surface),
        ) {
            Box(
                modifier = Modifier
                    .fillMaxHeight()
                    .fillMaxWidth(score.coerceIn(0, 100) / 100f)
                    .clip(RoundedCornerShape(999.dp))
                    .background(toneColor),
            )
        }
        Spacer(Modifier.height(16.dp))
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(8.dp))
                .background(colors.surface),
        ) {
            listOf("안전", "주의요함", "위험").forEach { label ->
                Text(
                    text = label,
                    modifier = Modifier
                        .weight(1f)
                        .padding(vertical = 12.dp),
                    textAlign = TextAlign.Center,
                    color = colors.muted,
                    fontSize = scaledSp(12, textScale),
                    fontWeight = FontWeight.Bold,
                )
            }
        }
    }
}

@Composable
private fun RiskBreakdown(breakdown: ScoreBreakdown, colors: SafeMedPalette, textScale: Float) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
            BreakdownCard("확정 위험", breakdown.danger, Tone.Danger, colors, textScale, Modifier.weight(1f))
            BreakdownCard("주의 신호", breakdown.warning, Tone.Warning, colors, textScale, Modifier.weight(1f))
        }
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
            BreakdownCard("개인 특성", breakdown.profile, Tone.Info, colors, textScale, Modifier.weight(1f))
            BreakdownCard("참고 신호", breakdown.info, Tone.Teal, colors, textScale, Modifier.weight(1f))
        }
    }
}

@Composable
private fun ReportSection(
    findings: List<RiskFinding>,
    safeCombinations: List<SafeCombination>,
    easySummary: String,
    colors: SafeMedPalette,
    textScale: Float,
) {
    var showAllWarnings by remember { mutableStateOf(false) }
    var showSafeDetails by remember { mutableStateOf(false) }
    var showEasySummary by remember { mutableStateOf(false) }
    val dangerFindings = findings.filter { it.severity == Severity.Danger }
    val warningFindings = findings.filter { it.severity == Severity.Warning }
    val infoFindings = findings.filter { it.severity == Severity.Info }
    val visibleWarnings = if (showAllWarnings) warningFindings else warningFindings.take(5)
    val hasExtraWarnings = warningFindings.size > visibleWarnings.size

    Column {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column {
                SectionLabel("리포트", colors, textScale)
                Spacer(Modifier.height(4.dp))
                Text(
                    text = "약물 조합 결과",
                    color = colors.ink,
                    fontSize = scaledSp(18, textScale),
                    fontWeight = FontWeight.Black,
                )
            }
            TextButton(onClick = { showEasySummary = !showEasySummary }) {
                Text(
                    text = "쉬운 설명 보기",
                    color = colors.orange,
                    fontSize = scaledSp(12, textScale),
                    fontWeight = FontWeight.ExtraBold,
                )
            }
        }
        AnimatedVisibility(showEasySummary) {
            Surface(color = colors.orangeSoft, shape = RoundedCornerShape(12.dp), modifier = Modifier.padding(top = 12.dp)) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("AI 쉬운 말 요약 예시", color = colors.orange, fontSize = scaledSp(14, textScale), fontWeight = FontWeight.Black)
                    Spacer(Modifier.height(12.dp))
                    Text(easySummary, color = colors.ink, fontSize = scaledSp(14, textScale), lineHeight = scaledSp(24, textScale))
                    Spacer(Modifier.height(12.dp))
                    Text("데모 프론트엔드에서 만든 예시 문장입니다. 실제 의료 AI 판단이 아닙니다.", color = colors.muted, fontSize = scaledSp(12, textScale), lineHeight = scaledSp(20, textScale))
                }
            }
        }
        Spacer(Modifier.height(24.dp))
        RiskGroup(
            title = "즉시확인이 필요한 조합",
            emptyText = "즉시 확인이 필요한 위험 조합은 발견되지 않았습니다.",
            findings = dangerFindings,
            tone = Tone.Danger,
            colors = colors,
            textScale = textScale,
        )
        Spacer(Modifier.height(20.dp))
        RiskGroup(
            title = "주의가 필요한 조합",
            emptyText = "주의 사항이 확인되지 않았습니다.",
            findings = visibleWarnings,
            tone = Tone.Warning,
            colors = colors,
            textScale = textScale,
        )
        if (hasExtraWarnings) {
            Spacer(Modifier.height(12.dp))
            TextButton(onClick = { showAllWarnings = true }) {
                Text("더 보기", color = colors.muted, fontSize = scaledSp(12, textScale), fontWeight = FontWeight.Bold)
            }
        }
        if (infoFindings.isNotEmpty()) {
            Spacer(Modifier.height(20.dp))
            RiskGroup(
                title = "참고 신호",
                emptyText = "",
                findings = infoFindings,
                tone = Tone.Info,
                colors = colors,
                textScale = textScale,
            )
        }
        Spacer(Modifier.height(20.dp))
        DividerLine(colors)
        Spacer(Modifier.height(16.dp))
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clickable { showSafeDetails = !showSafeDetails },
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text("안전 조합", color = colors.ink, fontSize = scaledSp(14, textScale), fontWeight = FontWeight.Black)
                Spacer(Modifier.height(8.dp))
                Text(
                    text = "현재 데이터 기준 안전 확인된 조합 ${safeCombinations.size}건",
                    color = colors.muted,
                    fontSize = scaledSp(12, textScale),
                    lineHeight = scaledSp(20, textScale),
                )
            }
            Text(
                text = if (showSafeDetails) "접기" else "보기",
                color = colors.muted,
                fontSize = scaledSp(12, textScale),
                fontWeight = FontWeight.Black,
            )
        }
        AnimatedVisibility(showSafeDetails) {
            Column(modifier = Modifier.padding(top = 16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                safeCombinations.take(6).forEach { combination ->
                    Surface(color = colors.surface, shape = RoundedCornerShape(8.dp), modifier = Modifier.fillMaxWidth()) {
                        Column(modifier = Modifier.padding(horizontal = 12.dp, vertical = 10.dp)) {
                            Text(
                                text = combination.medicines.joinToString(" + ") { it.name },
                                color = colors.ink,
                                fontSize = scaledSp(12, textScale),
                                fontWeight = FontWeight.Bold,
                            )
                            Spacer(Modifier.height(4.dp))
                            Text(combination.summary, color = colors.muted, fontSize = scaledSp(12, textScale))
                        }
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun RiskGroup(
    title: String,
    emptyText: String,
    findings: List<RiskFinding>,
    tone: Tone,
    colors: SafeMedPalette,
    textScale: Float,
) {
    Column {
        DividerLine(colors)
        Spacer(Modifier.height(16.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(title, color = colors.ink, fontSize = scaledSp(14, textScale), fontWeight = FontWeight.Black)
            if (findings.isNotEmpty()) {
                Text(
                    text = when (tone) {
                        Tone.Danger -> "높은위험"
                        Tone.Warning -> "주의"
                        else -> "참고"
                    },
                    color = tone.color(colors),
                    fontSize = scaledSp(10, textScale),
                    fontWeight = FontWeight.Black,
                )
            }
        }
        if (findings.isEmpty()) {
            Spacer(Modifier.height(16.dp))
            Text(emptyText, color = colors.muted, fontSize = scaledSp(12, textScale), lineHeight = scaledSp(20, textScale))
            return
        }

        Spacer(Modifier.height(16.dp))
        findings.forEach { finding ->
            FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                finding.medicines.forEach { medicine ->
                    Surface(color = colors.surface, shape = RoundedCornerShape(8.dp)) {
                        Text(
                            text = medicine.name,
                            color = colors.muted,
                            fontSize = scaledSp(12, textScale),
                            fontWeight = FontWeight.Bold,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 10.dp),
                        )
                    }
                }
            }
            Spacer(Modifier.height(12.dp))
            Row {
                Box(
                    modifier = Modifier
                        .size(20.dp)
                        .clip(CircleShape)
                        .background(tone.color(colors)),
                    contentAlignment = Alignment.Center,
                ) {
                    Text("!", color = Color.White, fontSize = scaledSp(12, textScale), fontWeight = FontWeight.Black)
                }
                Spacer(Modifier.width(8.dp))
                Text(
                    text = "${finding.title}\n${finding.reason}\n출처: ${finding.source}",
                    color = colors.muted,
                    fontSize = scaledSp(12, textScale),
                    lineHeight = scaledSp(20, textScale),
                    modifier = Modifier.weight(1f),
                )
            }
            Spacer(Modifier.height(18.dp))
        }
    }
}

@Composable
private fun DrugDetailCard(medicine: Medicine, colors: SafeMedPalette, textScale: Float) {
    Column {
        DividerLine(colors)
        Spacer(Modifier.height(16.dp))
        SectionLabel("약별 상세 정보", colors, textScale)
        Spacer(Modifier.height(12.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(16.dp), modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.weight(1f)) {
                Text(medicine.name, color = colors.ink, fontSize = scaledSp(16, textScale), fontWeight = FontWeight.Black)
                Spacer(Modifier.height(12.dp))
                DetailLine("이름", medicine.name, colors, textScale)
                DetailLine("성분", "${medicine.ingredientName} · ${medicine.ingredientCode}", colors, textScale)
                DetailLine("정보", medicine.description, colors, textScale)
                DetailLine("제조사", medicine.company, colors, textScale)
            }
            Surface(color = colors.surface, shape = RoundedCornerShape(8.dp), modifier = Modifier.size(width = 128.dp, height = 144.dp)) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
                    Text("약", color = colors.orange, fontSize = scaledSp(24, textScale), fontWeight = FontWeight.Black)
                    Spacer(Modifier.height(12.dp))
                    Text(medicine.category, color = colors.muted, fontSize = scaledSp(14, textScale), fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
                }
            }
        }
    }
}

@Composable
private fun TtsButton(text: String, colors: SafeMedPalette, textScale: Float) {
    val context = LocalContext.current
    var textToSpeech by remember { mutableStateOf<TextToSpeech?>(null) }

    DisposableEffect(context) {
        var engine: TextToSpeech? = null
        engine = TextToSpeech(context) { status ->
            if (status == TextToSpeech.SUCCESS) {
                engine?.language = Locale.KOREAN
            }
        }
        textToSpeech = engine

        onDispose {
            engine.stop()
            engine.shutdown()
        }
    }

    Button(
        onClick = {
            textToSpeech?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "safemed-report")
        },
        shape = RoundedCornerShape(12.dp),
        colors = ButtonDefaults.buttonColors(containerColor = colors.ink, contentColor = colors.page),
    ) {
        Text(
            text = "리포트 음성으로 듣기",
            fontSize = scaledSp(14, textScale),
            fontWeight = FontWeight.ExtraBold,
            modifier = Modifier.padding(vertical = 6.dp),
        )
    }
}

@Composable
private fun AccessibilityControls(
    largeText: Boolean,
    highContrast: Boolean,
    colors: SafeMedPalette,
    textScale: Float,
    onLargeTextChange: () -> Unit,
    onHighContrastChange: () -> Unit,
    onReset: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        modifier = modifier,
    ) {
        AccessButton("큰 글씨", largeText, colors, textScale, onLargeTextChange)
        AccessButton("고대비", highContrast, colors, textScale, onHighContrastChange)
        AccessButton("Reset", false, colors, textScale, onReset)
    }
}

@Composable
private fun AccessButton(
    text: String,
    active: Boolean,
    colors: SafeMedPalette,
    textScale: Float,
    onClick: () -> Unit,
) {
    Surface(
        shape = RoundedCornerShape(999.dp),
        color = if (active) colors.orange else colors.page,
        contentColor = if (active) Color.White else colors.muted,
        border = BorderStroke(1.dp, if (active) colors.orange else colors.line),
        modifier = Modifier.clickable(onClick = onClick),
    ) {
        Text(
            text = text,
            fontSize = scaledSp(12, textScale),
            fontWeight = FontWeight.Black,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
        )
    }
}

@Composable
private fun AnalyzeButton(
    enabled: Boolean,
    colors: SafeMedPalette,
    textScale: Float,
    onClick: () -> Unit,
) {
    Button(
        onClick = onClick,
        enabled = enabled,
        shape = RoundedCornerShape(12.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = colors.orange,
            contentColor = Color.White,
            disabledContainerColor = colors.surface,
            disabledContentColor = colors.muted,
        ),
        modifier = Modifier.fillMaxWidth(),
    ) {
        Text(
            text = "검색하기",
            fontSize = scaledSp(16, textScale),
            fontWeight = FontWeight.ExtraBold,
            modifier = Modifier.padding(vertical = 8.dp),
        )
    }
}

@Composable
private fun SexButton(
    text: String,
    selected: Boolean,
    colors: SafeMedPalette,
    textScale: Float,
    modifier: Modifier,
    onClick: () -> Unit,
) {
    Button(
        onClick = onClick,
        shape = RoundedCornerShape(12.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = if (selected) colors.orange else colors.surface,
            contentColor = if (selected) Color.White else colors.muted,
        ),
        modifier = modifier,
    ) {
        Text(
            text = text,
            fontSize = scaledSp(12, textScale),
            fontWeight = FontWeight.Bold,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(vertical = 6.dp),
        )
    }
}

@Composable
private fun MedicineChip(
    text: String,
    selected: Boolean,
    colors: SafeMedPalette,
    textScale: Float,
    onClick: () -> Unit,
) {
    Surface(
        shape = RoundedCornerShape(8.dp),
        color = if (selected) colors.orangeSoft else colors.surface,
        border = if (selected) BorderStroke(1.dp, colors.orange) else null,
        modifier = Modifier.clickable(enabled = !selected, onClick = onClick),
    ) {
        Text(
            text = text,
            color = if (selected) colors.orange else colors.muted,
            fontSize = scaledSp(12, textScale),
            fontWeight = FontWeight.SemiBold,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
        )
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun MedicineNameWrap(names: List<String>, colors: SafeMedPalette, textScale: Float) {
    FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        names.forEach { name ->
            Surface(color = colors.surface, shape = RoundedCornerShape(8.dp)) {
                Text(
                    text = name,
                    color = colors.muted,
                    fontSize = scaledSp(12, textScale),
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                )
            }
        }
    }
}

@Composable
private fun CountCard(
    label: String,
    value: Int,
    tone: Tone,
    colors: SafeMedPalette,
    textScale: Float,
    modifier: Modifier = Modifier,
) {
    Surface(color = colors.surface, shape = RoundedCornerShape(12.dp), modifier = modifier) {
        Column(modifier = Modifier.padding(12.dp)) {
            Text(label, color = colors.muted, fontSize = scaledSp(11, textScale), fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(8.dp))
            Surface(color = tone.softColor(colors), shape = RoundedCornerShape(12.dp)) {
                Text(
                    text = value.toString(),
                    color = tone.color(colors),
                    fontSize = scaledSp(20, textScale),
                    fontWeight = FontWeight.Black,
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp),
                )
            }
        }
    }
}

@Composable
private fun BreakdownCard(
    label: String,
    value: Int,
    tone: Tone,
    colors: SafeMedPalette,
    textScale: Float,
    modifier: Modifier = Modifier,
) {
    Surface(color = colors.surface, shape = RoundedCornerShape(12.dp), modifier = modifier) {
        Column(modifier = Modifier.padding(12.dp)) {
            Box(
                modifier = Modifier
                    .size(32.dp)
                    .clip(CircleShape)
                    .background(tone.softColor(colors)),
                contentAlignment = Alignment.Center,
            ) {
                Text("+", color = tone.color(colors), fontSize = scaledSp(17, textScale), fontWeight = FontWeight.Black)
            }
            Spacer(Modifier.height(12.dp))
            Text(label, color = colors.muted, fontSize = scaledSp(12, textScale), fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(4.dp))
            Text("+$value", color = colors.ink, fontSize = scaledSp(20, textScale), fontWeight = FontWeight.Black)
        }
    }
}

@Composable
private fun RiskLevelBadge(level: RiskLevel, colors: SafeMedPalette, textScale: Float) {
    Surface(color = level.softColor(colors), shape = RoundedCornerShape(999.dp)) {
        Text(
            text = level.label,
            color = level.toneColor(colors),
            fontSize = scaledSp(11, textScale),
            fontWeight = FontWeight.Black,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
        )
    }
}

@Composable
private fun DetailLine(label: String, value: String, colors: SafeMedPalette, textScale: Float) {
    Text(
        text = "$label: $value",
        color = colors.muted,
        fontSize = scaledSp(12, textScale),
        lineHeight = scaledSp(20, textScale),
    )
}

@Composable
private fun SectionLabel(text: String, colors: SafeMedPalette, textScale: Float) {
    Text(
        text = text,
        color = colors.ink,
        fontSize = scaledSp(14, textScale),
        fontWeight = FontWeight.Black,
    )
}

@Composable
private fun DividerLine(colors: SafeMedPalette) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(1.dp)
            .background(colors.line),
    )
}

private enum class Tone {
    Danger,
    Warning,
    Safe,
    Info,
    Teal,
}

private fun Tone.color(colors: SafeMedPalette): Color =
    when (this) {
        Tone.Danger -> colors.red
        Tone.Warning -> colors.yellow
        Tone.Safe -> colors.green
        Tone.Info -> colors.blue
        Tone.Teal -> colors.teal
    }

private fun Tone.softColor(colors: SafeMedPalette): Color =
    when (this) {
        Tone.Danger -> colors.redSoft
        Tone.Warning -> colors.orangeSoft
        Tone.Safe -> colors.greenSoft
        Tone.Info -> colors.blueSoft
        Tone.Teal -> colors.tealSoft
    }

private fun RiskLevel.toneColor(colors: SafeMedPalette): Color =
    when (this) {
        RiskLevel.Safe -> colors.green
        RiskLevel.Caution -> colors.orange
        RiskLevel.Danger -> colors.red
    }

private fun RiskLevel.softColor(colors: SafeMedPalette): Color =
    when (this) {
        RiskLevel.Safe -> colors.greenSoft
        RiskLevel.Caution -> colors.orangeSoft
        RiskLevel.Danger -> colors.redSoft
    }

private fun scaledSp(size: Int, scale: Float) = (size * scale).sp

private class SafeMedPalette(highContrast: Boolean) {
    val orange = Color(0xFFFF7A3D)
    val orangeDark = Color(0xFFF05D22)
    val red = Color(0xFFEF4D3F)
    val yellow = Color(0xFFF5BD26)
    val green = Color(0xFF39B56A)
    val blue = Color(0xFF2878D6)
    val teal = Color(0xFF0F9F9A)
    val root = if (highContrast) Color(0xFF050505) else Color(0xFFF3F3F3)
    val page = if (highContrast) Color(0xFF050505) else Color.White
    val surface = if (highContrast) Color(0xFF111111) else Color(0xFFF4F4F4)
    val ink = if (highContrast) Color.White else Color(0xFF252525)
    val muted = if (highContrast) Color.White else Color(0xFF777777)
    val line = if (highContrast) Color.White else Color(0xFFECECEC)
    val orangeSoft = if (highContrast) Color(0xFF111111) else Color(0xFFFFF1EA)
    val redSoft = if (highContrast) Color(0xFF111111) else Color(0xFFFFECEA)
    val greenSoft = if (highContrast) Color(0xFF111111) else Color(0xFFEAF8EF)
    val blueSoft = if (highContrast) Color(0xFF111111) else Color(0xFFEAF2FD)
    val tealSoft = if (highContrast) Color(0xFF111111) else Color(0xFFE7F7F6)
}
