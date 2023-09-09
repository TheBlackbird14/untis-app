export class HomeworkDto {
  id: number;
  dateAdded: Date;
  dateDue: Date;
  text: string;
  remark: string;
  teacher: string;
  subject: string;
  completed: boolean;
}
