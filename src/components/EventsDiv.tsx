import { getEvents } from "@/actions/getActions";
import { EventClientType } from "@/models/reference/Event";
import Link from "next/link";


export default async function EventsDiv(){

    //const router = useRouter();
    const events = await getEvents();

    //if (loading) return <div>Loading...</div>;
    if (!events) return <div>Events not found</div>;


    return (
            <div className="grid grid-cols-1 gap-2 space-x-2 w-fit">
                {events?.map((event:EventClientType) => (
                    <Link 
                        key={event._id} 
                        href={`events/${event._id}`}
                        className="p-2 hover:bg-gray-50 rounded shadow-sm bg-gray-100 w-full px-4 flex items-center"
                    >
                        <div className='flex flex-col gap-2 justify-start'>
                            <p className="font-bold text-2xl">{event.name}</p>
                            <p className="font-bold text-gray-400">{event.location}</p>
                            <p className="font-bold text-gray-400">{event.date}</p>
                        </div>
                    </Link>
                ))}
            </div>
    );
}