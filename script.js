// 导航菜单切换
document.querySelector('.menu-toggle').addEventListener('click', function() {
    document.querySelector('.nav-menu').classList.toggle('active');
});

// 标签页切换
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanels.forEach(p => p.classList.remove('active'));
        
        btn.classList.add('active');
        const panel = document.getElementById(`${btn.dataset.tab}-panel`);
        panel.classList.add('active');
    });
});

// 课程列表管理
let courseCount = 0;

function addCourse() {
    const courseList = document.getElementById('course-list');
    const courseItem = document.createElement('div');
    courseItem.className = 'course-item';
    courseItem.innerHTML = `
        <input type="text" placeholder="课程名称" class="course-name">
        <input type="number" placeholder="学分" class="course-credit" min="0" step="0.5">
        <select class="course-grade">
            ${getGradeOptions()}
        </select>
        <button onclick="removeCourse(this)" class="remove-btn">删除</button>
    `;
    courseList.appendChild(courseItem);
    courseCount++;
}

function removeCourse(btn) {
    btn.parentElement.remove();
    courseCount--;
}

// 根据成绩制度获取选项
function getGradeOptions() {
    const system = document.getElementById('grade-system').value;
    switch(system) {
        case 'hundred':
            return Array.from({length: 101}, (_, i) => `<option value="${i}">${i}</option>`).reverse().join('');
        case 'five':
            return `
                <option value="4.0">A (4.0)</option>
                <option value="3.7">A- (3.7)</option>
                <option value="3.3">B+ (3.3)</option>
                <option value="3.0">B (3.0)</option>
                <option value="2.7">B- (2.7)</option>
                <option value="2.3">C+ (2.3)</option>
                <option value="2.0">C (2.0)</option>
                <option value="1.7">C- (1.7)</option>
                <option value="1.0">D (1.0)</option>
                <option value="0">F (0)</option>
            `;
        case 'four':
            return `
                <option value="4.0">优 (4.0)</option>
                <option value="3.0">良 (3.0)</option>
                <option value="2.0">中 (2.0)</option>
                <option value="1.0">及格 (1.0)</option>
                <option value="0">不及格 (0)</option>
            `;
    }
}

// 成绩制度变更时更新所有课程的成绩选项
document.getElementById('grade-system').addEventListener('change', function() {
    document.querySelectorAll('.course-grade').forEach(select => {
        const currentValue = select.value;
        select.innerHTML = getGradeOptions();
        select.value = currentValue;
    });
});

// 计算GPA
function calculateGPA() {
    if (courseCount === 0) {
        alert('请至少添加一门课程！');
        return;
    }

    const courses = document.querySelectorAll('.course-item');
    let totalCredits = 0;
    let totalPoints = 0;
    let courseDetails = [];

    courses.forEach(course => {
        const name = course.querySelector('.course-name').value;
        const credit = parseFloat(course.querySelector('.course-credit').value);
        const grade = parseFloat(course.querySelector('.course-grade').value);

        if (!name || isNaN(credit) || isNaN(grade)) {
            alert('请填写完整的课程信息！');
            return;
        }

        totalCredits += credit;
        
        if (document.getElementById('calc-method').value === 'weighted') {
            totalPoints += credit * convertToGPA(grade);
        } else {
            totalPoints += convertToGPA(grade);
        }

        courseDetails.push({
            name: name,
            credit: credit,
            grade: grade,
            gpa: convertToGPA(grade)
        });
    });

    const finalGPA = document.getElementById('calc-method').value === 'weighted' 
        ? totalPoints / totalCredits 
        : totalPoints / courseCount;

    displayResult(finalGPA, totalCredits, courseDetails);
    saveToHistory(finalGPA, totalCredits, courseDetails);
}

// 成绩转换为GPA
function convertToGPA(grade) {
    const system = document.getElementById('grade-system').value;
    
    if (system === 'hundred') {
        if (grade >= 90) return 4.0;
        if (grade >= 85) return 3.7;
        if (grade >= 82) return 3.3;
        if (grade >= 78) return 3.0;
        if (grade >= 75) return 2.7;
        if (grade >= 72) return 2.3;
        if (grade >= 68) return 2.0;
        if (grade >= 64) return 1.7;
        if (grade >= 60) return 1.0;
        return 0;
    }
    
    return parseFloat(grade);
}

// 显示计算结果
function displayResult(gpa, credits, details) {
    const resultHtml = `
        <h3>GPA计算结果</h3>
        <div class="result-grid">
            <div class="result-item">
                <span class="label">GPA</span>
                <span class="value">${gpa.toFixed(2)}</span>
            </div>
            <div class="result-item">
                <span class="label">总学分</span>
                <span class="value">${credits.toFixed(1)}</span>
            </div>
        </div>
        <div class="course-details">
            <h4>课程明细</h4>
            ${details.map(course => `
                <div class="course-detail-item">
                    <p>${course.name}</p>
                    <p>学分：${course.credit} | 成绩：${course.grade} | GPA：${course.gpa.toFixed(2)}</p>
                </div>
            `).join('')}
        </div>
    `;

    document.getElementById('gpa-result').innerHTML = resultHtml;
}

// 成绩转换功能
function convertGrade() {
    const fromSystem = document.getElementById('from-system').value;
    const toSystem = document.getElementById('to-system').value;
    const originalGrade = document.getElementById('original-grade').value;

    if (!originalGrade) {
        alert('请输入原始成绩！');
        return;
    }

    const gpa = convertToGPA(parseFloat(originalGrade));
    const convertedGrade = convertFromGPA(gpa, toSystem);

    document.getElementById('convert-result').innerHTML = `
        <h3>成绩转换结果</h3>
        <div class="result-grid">
            <div class="result-item">
                <span class="label">原始成绩</span>
                <span class="value">${originalGrade}</span>
                <span class="unit">(${getSystemName(fromSystem)})</span>
            </div>
            <div class="result-item">
                <span class="label">转换成绩</span>
                <span class="value">${convertedGrade}</span>
                <span class="unit">(${getSystemName(toSystem)})</span>
            </div>
        </div>
    `;
}

// GPA转换为成绩
function convertFromGPA(gpa, toSystem) {
    switch(toSystem) {
        case 'hundred':
            if (gpa >= 4.0) return '90-100';
            if (gpa >= 3.7) return '85-89';
            if (gpa >= 3.3) return '82-84';
            if (gpa >= 3.0) return '78-81';
            if (gpa >= 2.7) return '75-77';
            if (gpa >= 2.3) return '72-74';
            if (gpa >= 2.0) return '68-71';
            if (gpa >= 1.7) return '64-67';
            if (gpa >= 1.0) return '60-63';
            return '0-59';
        case 'five':
            if (gpa >= 4.0) return 'A';
            if (gpa >= 3.7) return 'A-';
            if (gpa >= 3.3) return 'B+';
            if (gpa >= 3.0) return 'B';
            if (gpa >= 2.7) return 'B-';
            if (gpa >= 2.3) return 'C+';
            if (gpa >= 2.0) return 'C';
            if (gpa >= 1.7) return 'C-';
            if (gpa >= 1.0) return 'D';
            return 'F';
        case 'four':
            if (gpa >= 3.5) return '优';
            if (gpa >= 2.5) return '良';
            if (gpa >= 1.5) return '中';
            if (gpa >= 1.0) return '及格';
            return '不及格';
    }
}

// 获取成绩制度名称
function getSystemName(system) {
    switch(system) {
        case 'hundred': return '百分制';
        case 'five': return '五分制';
        case 'four': return '四分制';
    }
}

// 保存计算历史
function saveToHistory(gpa, credits, details) {
    const history = JSON.parse(localStorage.getItem('gpaHistory') || '[]');
    history.unshift({
        date: new Date().toLocaleString(),
        gpa: gpa,
        credits: credits,
        details: details
    });
    localStorage.setItem('gpaHistory', JSON.stringify(history.slice(0, 10)));
    updateHistoryDisplay();
}

// 更新历史记录显示
function updateHistoryDisplay() {
    const history = JSON.parse(localStorage.getItem('gpaHistory') || '[]');
    const historyHtml = history.map(record => `
        <div class="history-item">
            <div class="history-header">
                <span class="history-date">${record.date}</span>
                <span class="history-gpa">GPA: ${record.gpa.toFixed(2)}</span>
            </div>
            <div class="history-details">
                <p>总学分: ${record.credits.toFixed(1)}</p>
                <p>课程数: ${record.details.length}</p>
            </div>
        </div>
    `).join('');

    document.getElementById('history-list').innerHTML = historyHtml || '<p>暂无计算历史</p>';
}

// 初始化
addCourse();
updateHistoryDisplay();

// 输入验证
document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('input', function() {
        if (this.value < 0) this.value = 0;
    });
});

// 添加动画效果
document.querySelectorAll('.result-item').forEach(item => {
    item.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px)';
    });
    
    item.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// 提示卡片动画
document.querySelectorAll('.tip-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-3px)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
}); 