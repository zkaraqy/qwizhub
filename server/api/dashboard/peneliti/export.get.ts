import { requireRole } from '~~/server/utils/auth'
import { Project, Questionnaire, Response, Question, User } from '~~/server/models'
import { Op } from 'sequelize'
import ExcelJS from 'exceljs'

export default defineEventHandler(async (event) => {
    try {
        const user = await requireRole(event, 'peneliti')
        const query = getQuery(event)

        const format = ((query.format as string) || 'xlsx').toLowerCase()
        const questionnaireId = query.questionnaireId as string | undefined
        const statusFilter = (query.status as string) || 'all'

        // 1. Fetch user's projects
        const projects = await Project.findAll({
            where: { penelitiId: user.id },
            attributes: ['id', 'title']
        })
        const projectIds = projects.map(p => p.id)

        if (projectIds.length === 0) {
            throw createError({ statusCode: 404, statusMessage: 'Tidak ada proyek penelitian ditemukan' })
        }

        // 2. Fetch questionnaires with questions
        const qWhere: any = {
            projectId: { [Op.in]: projectIds }
        }
        if (questionnaireId && questionnaireId !== 'all') {
            qWhere.id = questionnaireId
        }

        const questionnaires = await Questionnaire.findAll({
            where: qWhere,
            include: [
                {
                    model: Project,
                    as: 'project',
                    attributes: ['id', 'title']
                },
                {
                    model: Question,
                    as: 'questions',
                    attributes: ['id', 'questionText', 'questionType', 'orderIndex']
                }
            ],
            order: [
                ['createdAt', 'DESC'],
                [{ model: Question, as: 'questions' }, 'orderIndex', 'ASC']
            ]
        })

        if (questionnaires.length === 0) {
            throw createError({ statusCode: 404, statusMessage: 'Kuesioner tidak ditemukan' })
        }

        const targetQIds = questionnaires.map(q => q.id)

        // 3. Fetch responses
        const respWhere: any = {
            questionnaireId: { [Op.in]: targetQIds }
        }
        if (statusFilter !== 'all') {
            respWhere.status = statusFilter
        }

        const responses = await Response.findAll({
            where: respWhere,
            include: [
                {
                    model: User,
                    as: 'respondent',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: Questionnaire,
                    as: 'questionnaire',
                    attributes: ['id', 'topic']
                }
            ],
            order: [['createdAt', 'DESC']]
        })

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)

        // Helper to format answers
        const formatAnswerValue = (val: any): string => {
            if (val === undefined || val === null) return ''
            if (Array.isArray(val)) return val.join(', ')
            return String(val)
        }

        // ─── EXCEL EXPORT (.xlsx) ───────────────────────────────────────────────────
        if (format === 'excel' || format === 'xlsx') {
            const workbook = new ExcelJS.Workbook()
            workbook.creator = 'QwizHub Research Platform'
            workbook.created = new Date()

            // Header styling helper
            const applyHeaderStyle = (row: ExcelJS.Row) => {
                row.eachCell((cell) => {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FF0E3B43' } // QwizHub Deep Teal
                    }
                    cell.font = {
                        name: 'Arial',
                        size: 11,
                        bold: true,
                        color: { argb: 'FFFFFFFF' }
                    }
                    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
                    cell.border = {
                        top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
                        left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
                        bottom: { style: 'medium', color: { argb: 'FF0E3B43' } },
                        right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
                    }
                })
                row.height = 32
            }

            // Single Questionnaire export
            if (questionnaires.length === 1) {
                const targetQ = questionnaires[0]
                const qQuestions = targetQ.questions || []
                const qResponses = responses.filter(r => r.questionnaireId === targetQ.id)

                const sheet = workbook.addWorksheet('Data Respons')

                // Build header columns
                const baseColumns = [
                    { header: 'Response ID', key: 'responseId', width: 36 },
                    { header: 'Kuesioner', key: 'questionnaire', width: 28 },
                    { header: 'Nama Responden', key: 'respondentName', width: 24 },
                    { header: 'Email Responden', key: 'respondentEmail', width: 28 },
                    { header: 'Status', key: 'status', width: 14 },
                    { header: 'Tanggal Mulai', key: 'startedAt', width: 20 },
                    { header: 'Tanggal Selesai', key: 'completedAt', width: 20 },
                    { header: 'Durasi (detik)', key: 'duration', width: 16 }
                ]

                const questionColumns = qQuestions.map((q, idx) => ({
                    header: `${idx + 1}. ${q.questionText}`,
                    key: `q_${q.id}`,
                    width: Math.min(50, Math.max(25, q.questionText.length + 5))
                }))

                sheet.columns = [...baseColumns, ...questionColumns]
                applyHeaderStyle(sheet.getRow(1))

                // Populate rows
                qResponses.forEach(r => {
                    const rowData: any = {
                        responseId: r.id,
                        questionnaire: targetQ.topic,
                        respondentName: r.respondent?.name || 'Anonim',
                        respondentEmail: r.respondent?.email || '-',
                        status: r.status === 'completed' ? 'Selesai' : 'Sedang Mengisi',
                        startedAt: r.startedAt ? new Date(r.startedAt).toLocaleString('id-ID') : '-',
                        completedAt: r.completedAt ? new Date(r.completedAt).toLocaleString('id-ID') : '-',
                        duration: r.startedAt && r.completedAt
                            ? Math.round((new Date(r.completedAt).getTime() - new Date(r.startedAt).getTime()) / 1000)
                            : '-'
                    }

                    const answersList = Array.isArray(r.answers) ? r.answers : []
                    qQuestions.forEach(q => {
                        const ansObj = answersList.find((a: any) => a.questionId === q.id)
                        rowData[`q_${q.id}`] = ansObj ? formatAnswerValue(ansObj.answer) : ''
                    })

                    const insertedRow = sheet.addRow(rowData)
                    insertedRow.alignment = { vertical: 'middle' }
                })

                // Info Sheet
                const infoSheet = workbook.addWorksheet('Info Kuesioner')
                infoSheet.columns = [
                    { header: 'Atribut', key: 'attr', width: 25 },
                    { header: 'Nilai', key: 'val', width: 50 }
                ]
                applyHeaderStyle(infoSheet.getRow(1))
                infoSheet.addRow({ attr: 'Judul Kuesioner', val: targetQ.topic })
                infoSheet.addRow({ attr: 'Tujuan Penelitian', val: targetQ.researchObjective })
                infoSheet.addRow({ attr: 'Status Kuesioner', val: targetQ.status })
                infoSheet.addRow({ attr: 'Target Responden', val: targetQ.targetRespondents || 0 })
                infoSheet.addRow({ attr: 'Total Respons Masuk', val: qResponses.length })
                infoSheet.addRow({ attr: 'Respons Selesai', val: qResponses.filter(r => r.status === 'completed').length })
                infoSheet.addRow({ attr: 'Jumlah Pertanyaan', val: qQuestions.length })
                infoSheet.addRow({ attr: 'Tanggal Dibuat', val: new Date(targetQ.createdAt).toLocaleString('id-ID') })
                infoSheet.addRow({ attr: 'Tanggal Export', val: new Date().toLocaleString('id-ID') })

            } else {
                // Multi-Questionnaire export: Summary sheet + individual sheets for each questionnaire
                const summarySheet = workbook.addWorksheet('Ringkasan Kuesioner')
                summarySheet.columns = [
                    { header: 'No', key: 'no', width: 8 },
                    { header: 'Judul Kuesioner', key: 'topic', width: 32 },
                    { header: 'Proyek', key: 'project', width: 24 },
                    { header: 'Status', key: 'status', width: 14 },
                    { header: 'Target', key: 'target', width: 12 },
                    { header: 'Respons Masuk', key: 'responses', width: 16 },
                    { header: 'Respons Selesai', key: 'completed', width: 16 },
                    { header: 'Persentase (%)', key: 'rate', width: 16 },
                    { header: 'Jumlah Pertanyaan', key: 'questions', width: 18 }
                ]
                applyHeaderStyle(summarySheet.getRow(1))

                questionnaires.forEach((q, idx) => {
                    const qResponses = responses.filter(r => r.questionnaireId === q.id)
                    const completedCount = qResponses.filter(r => r.status === 'completed').length
                    summarySheet.addRow({
                        no: idx + 1,
                        topic: q.topic,
                        project: q.project?.title || '',
                        status: q.status,
                        target: q.targetRespondents || 0,
                        responses: qResponses.length,
                        completed: completedCount,
                        rate: q.targetRespondents > 0 ? `${Math.round((completedCount / q.targetRespondents) * 100)}%` : '-',
                        questions: q.questions?.length || 0
                    })
                })

                // Create individual sheets for each questionnaire
                questionnaires.forEach((q, qIndex) => {
                    const cleanSheetName = (q.topic || `Kuesioner_${qIndex + 1}`)
                        .replace(/[*?:\/\\\[\]]/g, '')
                        .slice(0, 30)
                    const sheet = workbook.addWorksheet(cleanSheetName)
                    const qQuestions = q.questions || []
                    const qResponses = responses.filter(r => r.questionnaireId === q.id)

                    const baseColumns = [
                        { header: 'Response ID', key: 'responseId', width: 36 },
                        { header: 'Nama Responden', key: 'respondentName', width: 24 },
                        { header: 'Email Responden', key: 'respondentEmail', width: 28 },
                        { header: 'Status', key: 'status', width: 14 },
                        { header: 'Waktu Selesai', key: 'completedAt', width: 20 }
                    ]
                    const questionColumns = qQuestions.map((ques, idx) => ({
                        header: `${idx + 1}. ${ques.questionText}`,
                        key: `q_${ques.id}`,
                        width: Math.min(45, Math.max(20, ques.questionText.length + 5))
                    }))

                    sheet.columns = [...baseColumns, ...questionColumns]
                    applyHeaderStyle(sheet.getRow(1))

                    qResponses.forEach(r => {
                        const rowData: any = {
                            responseId: r.id,
                            respondentName: r.respondent?.name || 'Anonim',
                            respondentEmail: r.respondent?.email || '-',
                            status: r.status === 'completed' ? 'Selesai' : 'Sedang Mengisi',
                            completedAt: r.completedAt ? new Date(r.completedAt).toLocaleString('id-ID') : '-'
                        }
                        const answersList = Array.isArray(r.answers) ? r.answers : []
                        qQuestions.forEach(ques => {
                            const ansObj = answersList.find((a: any) => a.questionId === ques.id)
                            rowData[`q_${ques.id}`] = ansObj ? formatAnswerValue(ansObj.answer) : ''
                        })
                        sheet.addRow(rowData)
                    })
                })
            }

            const buffer = await workbook.xlsx.writeBuffer()

            const filename = questionnaires.length === 1
                ? `QwizHub_Respons_${(questionnaires[0].topic || 'Kuesioner').replace(/\s+/g, '_')}_${timestamp}.xlsx`
                : `QwizHub_Semua_Respons_${timestamp}.xlsx`

            setHeader(event, 'Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            setHeader(event, 'Content-Disposition', `attachment; filename="${filename}"`)
            return buffer
        }

        // ─── CSV EXPORT ───────────────────────────────────────────────────────────
        const escapeCSV = (val: any): string => {
            if (val === undefined || val === null) return '""'
            const str = String(val).replace(/"/g, '""')
            return `"${str}"`
        }

        let csvContent = '\uFEFF' // UTF-8 BOM for Excel compatibility

        if (questionnaires.length === 1) {
            const targetQ = questionnaires[0]
            const qQuestions = targetQ.questions || []
            const qResponses = responses.filter(r => r.questionnaireId === targetQ.id)

            // Header line
            const headers = [
                'Response ID',
                'Kuesioner',
                'Nama Responden',
                'Email Responden',
                'Status',
                'Tanggal Mulai',
                'Tanggal Selesai',
                'Durasi (detik)',
                ...qQuestions.map((q, idx) => `${idx + 1}. ${q.questionText}`)
            ]
            csvContent += headers.map(escapeCSV).join(',') + '\r\n'

            // Rows
            qResponses.forEach(r => {
                const answersList = Array.isArray(r.answers) ? r.answers : []
                const duration = r.startedAt && r.completedAt
                    ? Math.round((new Date(r.completedAt).getTime() - new Date(r.startedAt).getTime()) / 1000)
                    : ''

                const row = [
                    r.id,
                    targetQ.topic,
                    r.respondent?.name || 'Anonim',
                    r.respondent?.email || '-',
                    r.status === 'completed' ? 'Selesai' : 'Sedang Mengisi',
                    r.startedAt ? new Date(r.startedAt).toLocaleString('id-ID') : '',
                    r.completedAt ? new Date(r.completedAt).toLocaleString('id-ID') : '',
                    duration,
                    ...qQuestions.map(q => {
                        const ansObj = answersList.find((a: any) => a.questionId === q.id)
                        return ansObj ? formatAnswerValue(ansObj.answer) : ''
                    })
                ]
                csvContent += row.map(escapeCSV).join(',') + '\r\n'
            })
        } else {
            // All questionnaires: Master responses CSV
            const headers = [
                'Response ID',
                'Kuesioner ID',
                'Judul Kuesioner',
                'Nama Responden',
                'Email Responden',
                'Status',
                'Tanggal Mulai',
                'Tanggal Selesai',
                'Jumlah Jawaban Terisi'
            ]
            csvContent += headers.map(escapeCSV).join(',') + '\r\n'

            responses.forEach(r => {
                const row = [
                    r.id,
                    r.questionnaireId,
                    r.questionnaire?.topic || '-',
                    r.respondent?.name || 'Anonim',
                    r.respondent?.email || '-',
                    r.status === 'completed' ? 'Selesai' : 'Sedang Mengisi',
                    r.startedAt ? new Date(r.startedAt).toLocaleString('id-ID') : '',
                    r.completedAt ? new Date(r.completedAt).toLocaleString('id-ID') : '',
                    Array.isArray(r.answers) ? r.answers.length : 0
                ]
                csvContent += row.map(escapeCSV).join(',') + '\r\n'
            })
        }

        const filename = questionnaires.length === 1
            ? `QwizHub_Respons_${(questionnaires[0].topic || 'Kuesioner').replace(/\s+/g, '_')}_${timestamp}.csv`
            : `QwizHub_Semua_Respons_${timestamp}.csv`

        setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
        setHeader(event, 'Content-Disposition', `attachment; filename="${filename}"`)
        return csvContent

    } catch (error: any) {
        if (error.statusCode) throw error
        console.error('Export responses error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Gagal mengekspor data kuesioner'
        })
    }
})
