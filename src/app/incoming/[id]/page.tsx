import { getIncomingTaskById } from "@/app/actions/getIncomingTaskById";
import { IncomingTaskDetailsClient } from "@/components/IncomingTaskDetailsClient"; // Import the client component

export default async function IncomingTaskDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const { task, error } = await getIncomingTaskById(id);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!task) {
    return <div>Task not found</div>;
}

  return <IncomingTaskDetailsClient task={task} />;
}
