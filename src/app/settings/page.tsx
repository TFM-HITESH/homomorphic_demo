import { SettingsForm } from "@/components/SettingsForm";
import { getUserData } from "@/app/actions/getUserData";

export default async function SettingsPage() {
  const userData = await getUserData();

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto">
        <SettingsForm userData={userData} />
      </div>
    </div>
  );
}
