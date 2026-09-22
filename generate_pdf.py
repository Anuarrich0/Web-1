import os
import sys
import html
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Register DejaVuSans TrueType fonts for Cyrillic support
dejavu_dir = "/usr/share/fonts/truetype/dejavu"
pdfmetrics.registerFont(TTFont("DejaVu", os.path.join(dejavu_dir, "DejaVuSans.ttf")))
pdfmetrics.registerFont(TTFont("DejaVu-Bold", os.path.join(dejavu_dir, "DejaVuSans-Bold.ttf")))

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("DejaVu", 9)
        self.setFillColor(colors.HexColor("#718096"))

        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 750, "Отчёт по верстке и руководство по защите — Underground Gym (Anuar)")
            self.setStrokeColor(colors.HexColor("#CBD5E0"))
            self.setLineWidth(0.5)
            self.line(54, 742, 558, 742)

        # Footer
        footer_text = f"Страница {self._pageNumber} из {page_count}"
        self.drawRightString(558, 36, footer_text)
        self.drawString(54, 36, "Underground Gym — Веб-разработка | Студент: Anuar")
        self.setStrokeColor(colors.HexColor("#CBD5E0"))
        self.setLineWidth(0.5)
        self.line(54, 48, 558, 48)

        self.restoreState()

def build_pdf():
    pdf_path = "Anuar_Project_Report_and_Defense_Guide.pdf"
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom Palette
    COLOR_PRIMARY = colors.HexColor("#1A202C")
    COLOR_ACCENT = colors.HexColor("#2B6CB0")
    COLOR_LIME = colors.HexColor("#82C91E")
    COLOR_BG_LIGHT = colors.HexColor("#F7FAFC")
    COLOR_TEXT = colors.HexColor("#2D3748")
    COLOR_MUTED = colors.HexColor("#718096")
    COLOR_CODE_BG = colors.HexColor("#EDF2F7")
    COLOR_BORDER = colors.HexColor("#E2E8F0")

    # Custom Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        fontName='DejaVu-Bold',
        fontSize=22,
        leading=26,
        textColor=COLOR_PRIMARY,
        spaceAfter=8
    )

    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        fontName='DejaVu',
        fontSize=11,
        leading=15,
        textColor=COLOR_ACCENT,
        spaceAfter=14
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        fontName='DejaVu-Bold',
        fontSize=15,
        leading=19,
        textColor=COLOR_PRIMARY,
        spaceBefore=14,
        spaceAfter=10,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        fontName='DejaVu-Bold',
        fontSize=11.5,
        leading=15,
        textColor=COLOR_ACCENT,
        spaceBefore=10,
        spaceAfter=6,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        fontName='DejaVu',
        fontSize=9.5,
        leading=13.5,
        textColor=COLOR_TEXT,
        spaceAfter=8
    )

    body_bold = ParagraphStyle(
        'Body_Bold',
        fontName='DejaVu-Bold',
        fontSize=9.5,
        leading=13.5,
        textColor=COLOR_PRIMARY,
        spaceAfter=8
    )

    code_style = ParagraphStyle(
        'Code_Block',
        fontName='DejaVu',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#6B46C1"),
        spaceAfter=4
    )

    explain_style = ParagraphStyle(
        'Explain_Box',
        fontName='DejaVu',
        fontSize=9,
        leading=13,
        textColor=COLOR_TEXT,
        spaceAfter=8
    )

    story = []

    # Title Banner Block
    story.append(Paragraph("ОТЧЁТ О ПРОДЕЛАННОЙ РАБОТЕ И ПОЛНОЕ ОБУЧЕНИЕ К ЗАЩИТЕ ПРОЕКТА", title_style))
    story.append(Paragraph("<b>Страницы:</b> Pricing (Абонементы) & Promotions (Акции) | <b>Автор:</b> Anuar | <b>Проект:</b> Underground Gym", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=COLOR_ACCENT, spaceBefore=0, spaceAfter=14))

    # SECTION 1: Summary of Work Done
    story.append(Paragraph("1. Отчёт о проделанной работе (Что сделано)", h1_style))
    story.append(Paragraph(
        "В рамках оформления веб-сайта фитнес-сети <b>Underground Gym</b> для страниц <b>Pricing (pricing.html)</b> "
        "и <b>Promotions (promotions.html)</b> был выполнен полный комплекс работ по вёрстке, стилизации и структурированию кода:",
        body_style
    ))

    work_items = [
        ("Единая цветовая гамма и дизайн-система", "Подключена общая база стилей <code>base.css</code> и написан персональный файл стилей <code>anuar.css</code>. Вся цветовая палитра основана на фирменной тёмной теме Underground Gym: глубокий тёмный фон (<code>--bg-primary</code>), контрастные карточки (<code>--bg-secondary</code>) и фирменный неоново-лимонный акцент (<code>--accent-lime</code>)."),
        ("Оформление страницы Pricing (pricing.html)", "Сверстана сетка карточек тарифных планов (Silver, Gold, Platinum / GYM, EXP, BIG+) с выделением популярных и премиум тарифов. Создана адаптивная интерактивная таблица сравнения цен по срокам (1, 3, 6, 12 месяцев), интерактивный блок-совет по выгоде, а также современная форма онлайн-заявки с подбором тарифов и радио-кнопками."),
        ("Оформление страницы Promotions (promotions.html)", "Оформлены категории акций для новых клиентов и действующих участников, акционный баннер «Приведи друга», пошаговые списки получения студенческой скидки, а также интерактивные аккордеоны (раскрывающиеся блоки <code>&lt;details&gt;</code>) для правил клуба."),
        ("Исправление путей и ссылок", "Исправлены пути к CSS и логотипам (<code>../assets/css/base.css</code>, <code>../assets/css/anuar.css</code>), закрыты незакрытые теги в шапках и подвалах.")
    ]

    for title, desc in work_items:
        p_title = Paragraph(f"• <b>{title}</b>", body_bold)
        p_desc = Paragraph(desc, body_style)
        story.append(p_title)
        story.append(p_desc)
        story.append(Spacer(1, 3))

    story.append(Spacer(1, 10))

    # SECTION 2: Code Breakdown Like I'm 5
    story.append(Paragraph("2. Полный разбор кода «Как 5-летнему» (Разбор каждого куска)", h1_style))
    story.append(Paragraph(
        "Представь, что создание веб-страницы — это постройка дома из детского конструктора LEGO. "
        "<b>HTML</b> — это пластмассовые кирпичики (стены, окна, двери), а <b>CSS</b> — это волшебная краска и декорации, "
        "которые делают дом красивым и уютным.",
        body_style
    ))

    explain_data = [
        (
            "1. Шапка сайта (<header> и <nav>)",
            "<!DOCTYPE html>\n<header class=\"site-header\">\n  <a href=\"../index.html\"><img src=\"logo.svg\"></a>\n  <nav><ul class=\"nav-list\">\n    <li><a href=\"pricing.html\">Абонементы</a></li>\n  </ul></nav>\n</header>",
            "<b>Простое объяснение:</b> Это крыша и вывеска нашего детского магазина. <code>&lt;header&gt;</code> — это вся верхушка. Внутри лежит логотип (картинка) и меню <code>&lt;nav&gt;</code>, где по кнопочкам-ссылкам <code>&lt;a&gt;</code> клиент может переходить из одной комнаты в другую."
        ),
        (
            "2. Карточки тарифов (<article> и CSS Grid)",
            "<div class=\"pricing-grid\">\n  <article class=\"pricing-card popular\">\n    <h3>GYM / EXP+</h3>\n    <p class=\"price\">35 000 ₸</p>\n    <a href=\"#order-form\" class=\"btn\">Выбрать</a>\n  </article>\n</div>",
            "<b>Простое объяснение:</b> Представь витрину с коробочками игрушек. Каждая коробочка — это <code>&lt;article class=\"pricing-card\"&gt;</code>. Внутри написано название, цена и лежит кнопка. А в CSS с помощью <code>display: grid</code> мы говорим компьютеру: 'Поставь эти коробочки ровно в ряд по 3 штуки, а если экран маленький — поставь друг под друга!'"
        ),
        (
            "3. Таблица цен (<table>, <thead>, <tbody>)",
            "<table>\n  <thead><tr><th>Тариф</th><th>1 мес</th></tr></thead>\n  <tbody><tr><td>GYM/EXP</td><td>30 000</td></tr></tbody>\n</table>",
            "<b>Простое объяснение:</b> Это школьная тетрадка в клеточку! <code>&lt;table&gt;</code> — вся тетрадь. <code>&lt;thead&gt;</code> — верхняя строка с названиями колоночек, а <code>&lt;tbody&gt;</code> — строчки с циферками. В CSS мы рисуем ровные серо-зеленые рамки вокруг клеток."
        ),
        (
            "4. Раскрывающийся список (<details> и <summary>)",
            "<details class=\"styled-details\">\n  <summary>Заморозка абонемента</summary>\n  <p>Можно заморозить на 14 дней бесплатно!</p>\n</details>",
            "<b>Простое объяснение:</b> Это волшебная сундучок с секретом! Когда ты видишь только крышку <code>&lt;summary&gt;</code>, написано 'Заморозка'. Нажимаешь пальчиком — сундучок открывается <code>&lt;details&gt;</code>, и внутри появляется подробный текст!"
        ),
        (
            "5. Форма заявки (<form>, <input>, <select>)",
            "<form action=\"#\" method=\"post\">\n  <label for=\"client-name\">Имя:</label>\n  <input type=\"text\" id=\"client-name\" required>\n  <select><option>12 месяцев</option></select>\n  <button type=\"submit\">Отправить</button>\n</form>",
            "<b>Простое объяснение:</b> Это бланк-анкета для поступления в секцию. <code>&lt;input&gt;</code> — пустое окошко, куда ты карандашиком пишешь своё имя или телефон. <code>&lt;select&gt;</code> — выпадающий список, где выбираешь срок. А кнопка <code>&lt;button type=\"submit\"&gt;</code> отправляет анкету тренеру."
        ),
        (
            "6. Цвета и CSS Переменные (:root и Variables)",
            ":root {\n  --bg-primary: #0d0f12;\n  --accent-lime: #ccff00;\n}\n.pricing-card { background: var(--bg-secondary); }",
            "<b>Простое объяснение:</b> Переменные — это баночки с подписанной краской. Вместо того чтобы каждый раз искать сложный номер цвета `#ccff00`, мы создали баночку `--accent-lime`. Теперь мы просто машем кисточкой `var(--accent-lime)` и окрашиваем все кнопки в яркий неоновый цвет Underground Gym!"
        )
    ]

    for title, code_text, explain in explain_data:
        block = []
        block.append(Paragraph(title, h2_style))

        # Safe escape code string for ReportLab
        safe_code = html.escape(code_text).replace('\n', '<br/>').replace(' ', '&nbsp;')
        code_p = Paragraph(safe_code, code_style)

        t_code = Table([[code_p]], colWidths=[504])
        t_code.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), COLOR_CODE_BG),
            ('BOX', (0,0), (-1,-1), 1, COLOR_BORDER),
            ('PADDING', (0,0), (-1,-1), 8),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        block.append(t_code)
        block.append(Spacer(1, 4))

        block.append(Paragraph(explain, explain_style))
        block.append(Spacer(1, 6))
        story.append(KeepTogether(block))

    story.append(Spacer(1, 10))

    # SECTION 3: Defense Prep Guide
    story.append(Paragraph("3. Подготовка к защите проекта (Руководство для студента)", h1_style))
    story.append(Paragraph(
        "На защите преподаватель проверяет, понимаешь ли ты структуру своего кода. "
        "Ниже собраны самые частые вопросы экзаменаторов и готовые идеальные ответы.",
        body_style
    ))

    qa_list = [
        (
            "Вопрос 1: За что отвечаешь именно ты в этом проекте?",
            "<b>Ответ:</b> Я (Anuar) отвечаю за две ключевые коммерческие страницы сайта Underground Gym — «Абонементы» (<code>pages/pricing.html</code>) и «Акции» (<code>pages/promotions.html</code>), а также за их стилизацию в файле <code>assets/css/anuar.css</code>."
        ),
        (
            "Вопрос 2: Как устроена цветовая гамма и стили на твоих страницах?",
            "<b>Ответ:</b> Я использовал единую дизайн-систему на базе CSS-переменных из <code>base.css</code>. Основной тёмный фон <code>#0d0f12</code> задан переменной <code>--bg-primary</code>, карточки и блоки выполнены в фоновом цвете <code>--bg-secondary</code>, а акцентные кнопки, рамки и бейджи окрашены в фирменный неоново-лимонный цвет <code>--accent-lime (#ccff00)</code>."
        ),
        (
            "Вопрос 3: Зачем нужен файл anuar.css, если есть base.css?",
            "<b>Ответ:</b> <code>base.css</code> содержит общие глобальные стили (сброс CSS, переменные, стили шапки и подвала). А мой файл <code>anuar.css</code> содержит уникальные стили для моих страниц: сетку карточек тарифов (Grid), стили таблицы цен, аккордеонов rules и формы заявки. Это обеспечивает модульность кода."
        ),
        (
            "Вопрос 4: Как работает адаптивность на страницах?",
            "<b>Ответ:</b> Использован подход Responsive Web Design с помощью <code>CSS Grid</code> (<code>grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))</code>) и медиа-запросов <code>@media (max-width: 768px)</code>. На мобильных устройствах карточки и блоки формы выстраиваются в одну колонку, а таблица имеет горизонтальную прокрутку (<code>overflow-x: auto</code>)."
        ),
        (
            "Вопрос 5: Какая теговая семантика использована на странице?",
            "<b>Ответ:</b> Код полностью семантичен: <code>&lt;header&gt;</code> для шапки, <code>&lt;nav&gt;</code> для навигации, <code>&lt;main&gt;</code> для основного контента, <code>&lt;section&gt;</code> для логических разделов, <code>&lt;article&gt;</code> для самостоятельных карточек тарифов/акций, <code>&lt;details&gt;/&lt;summary&gt;</code> для раскрывающихся правил и <code>&lt;footer&gt;</code> для подвала."
        )
    ]

    for q, a in qa_list:
        p_q = Paragraph(f"❓ <b>{q}</b>", h2_style)
        p_a = Paragraph(f"💡 {a}", body_style)
        story.append(KeepTogether([p_q, p_a, Spacer(1, 4)]))

    story.append(Spacer(1, 10))

    # Tag Dictionary Table
    story.append(Paragraph("Краткая шпаргалка по тегам (Tag Dictionary)", h2_style))

    table_data = [
        [Paragraph("<b>Тег HTML</b>", body_bold), Paragraph("<b>Назначение и аналогия</b>", body_bold)],
        [Paragraph("<code>&lt;article&gt;</code>", body_style), Paragraph("Самостоятельный блок (карточка товара или тарифа)", body_style)],
        [Paragraph("<code>&lt;details&gt;</code>", body_style), Paragraph("Раскрывающийся контейнер (аккордеон)", body_style)],
        [Paragraph("<code>&lt;summary&gt;</code>", body_style), Paragraph("Заголовок раскрывающегося блока", body_style)],
        [Paragraph("<code>&lt;table&gt;</code>", body_style), Paragraph("Таблица данных для сравнения цен", body_style)],
        [Paragraph("<code>&lt;fieldset&gt;</code>", body_style), Paragraph("Группа связанных полей формы с рамкой", body_style)],
        [Paragraph("<code>&lt;legend&gt;</code>", body_style), Paragraph("Заголовок для группы полей fieldset", body_style)],
        [Paragraph("<code>&lt;mark&gt;</code>", body_style), Paragraph("Выделение текста маркером/подсветкой", body_style)],
    ]

    t_tags = Table(table_data, colWidths=[140, 364])
    t_tags.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), COLOR_CODE_BG),
        ('GRID', (0,0), (-1,-1), 0.5, COLOR_BORDER),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_tags)

    story.append(Spacer(1, 14))

    # Final Encouragement Box
    enc_title = Paragraph("<b>🎯 Финальный совет для отличной оценки на защите:</b>", body_bold)
    enc_text = Paragraph(
        "Говори уверенно! Начни ответ так: <i>«Здравствуйте! В нашем командном проекте Underground Gym я отвечал за коммерческий блок: страницы Абонементов и Акций. Я полностью сверстал их на HTML5/CSS3, оформил стильную тёмную тему с лимонными акцентами и сделал удобную форму заказа...»</i>. У тебя всё получится!",
        body_style
    )

    t_box = Table([[enc_title], [enc_text]], colWidths=[504])
    t_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F0FFF4")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#68D391")),
        ('PADDING', (0,0), (-1,-1), 12),
    ]))
    story.append(t_box)

    doc.build(story, canvasmaker=NumberedCanvas)
    print("PDF build successful.")

if __name__ == "__main__":
    build_pdf()
