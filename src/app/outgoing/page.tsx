import { getOutgoingTasks } from "@/app/actions/getOutgoingTasks";
import { OutgoingTasks } from "@/components/OutgoingTasks";

export default async function OutgoingPage() {
  const { tasks, error } = await getOutgoingTasks();

  if (error) {
    // Handle error appropriately
    return <p>Error fetching tasks: {error}</p>;
  }

  return <OutgoingTasks tasks={tasks} />;
}
