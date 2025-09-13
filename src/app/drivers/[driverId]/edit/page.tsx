import DriverForm from '@/components/forms/driver-form';
import { getDriver } from '@/actions/getActions';
import { DriverClientType } from '@/models/reference/Driver';


export default async function EditDriverPage({
    params,
  }: {
    params: Promise<{ driverId: string; }>
  }) {
  const { driverId } = await params;

  let driver: DriverClientType;
  try {
    console.log('Fetching driver with ID:', driverId);
    driver = await getDriver(driverId);
    console.log('Fetched driver:', driver);
  } catch {
    console.error('Error fetching driver:', driverId);
    return <div>Driver not found</div>;
  }

  if (!driver) {
    return <div className="p-6">Driver not found</div>;
  }

  return (
    <div className="p-8">
      <DriverForm initialData={driver as DriverClientType} />
    </div>
  );
}