export interface HomeworkData {
    records: Array<{ 
        homeworkId: number; 
        teacherId: number; 
        elementIds: Array<number>;
    }>;

    homeworks: Array<{
        id: number;
        lessonId: number;
        date: number;
        dueDate: number;
        text: string;
        remark?: string;
        completed: boolean;
        attachments: any[];
    }>

    teachers: Array<{
        id: number;
        name: string;
    }>

    lessons: Array<{
        id: number;
        subject: string;
        lessonType: string;
    }>
}