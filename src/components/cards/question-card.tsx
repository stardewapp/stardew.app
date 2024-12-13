import { Card } from "../ui/card";

interface Props {
  question: string;
  answer: string;
  Icon?: any;
}

export const QuestionCard = ({ question, answer, Icon }: Props) => {
  return (
<<<<<<< HEAD
    <Card className="mb-4 flex break-inside-avoid-column flex-col gap-2 p-4">
=======
    <Card className="flex flex-col gap-2 p-4">
>>>>>>> 8e7d601dc57df1164d3bf7b9dc76008a9249de30
      <div className="flex items-center gap-4">
        <Card>{Icon && <Icon className="h-10 w-10 p-2" />}</Card>
        <h1 className="text-lg font-semibold">{question}</h1>
      </div>
      <div>
        <p className="text-neutral-500 dark:text-neutral-400">{answer}</p>
      </div>
    </Card>
  );
};
