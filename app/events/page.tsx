
import Image from "next/image"
import Link from "next/link"
import SupplierAds from "@/components/SupplierAds"
import { graphqlRequest } from "@/lib/graphql/server"
import { EVENTS_LIST_QUERY } from "@/lib/graphql/queries"

type Event = {
  id: string
  title: string
  slug: string
  logoUrl?: string
  bannerUrl?: string
  startDate: string
  endDate: string
  location?: string
  description: string
  registerUrl?: string
}

async function getEvents(search?: string): Promise<Event[]> {
  try {
    const data = await graphqlRequest<{ events: Event[] }>(EVENTS_LIST_QUERY, {
      filter: {
        search: search || undefined,
        upcoming: true,
      },
    })
    return data.events
  } catch (err) {
    console.error("Failed to fetch events:", err)
    return []
  }
}

type PageProps = {
  searchParams: Promise<{
    q?: string
  }>
}

export default async function EventsPage({ searchParams }: PageProps) {
  const { q = "" } = await searchParams

  const events = await getEvents(q)
  const featuredEvent = events[0]

  return (
    <div className="w-full">
      {featuredEvent?.bannerUrl && (
        <div className="relative w-full h-[360px]">
          <Image
            src={featuredEvent.bannerUrl}
            alt={featuredEvent.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
          <h1 className="text-3xl font-bold mb-6">Find an Event</h1>

          <form className="border-b pb-6 mb-8 flex gap-4">
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search events by title"
              className="border px-4 py-2 w-full max-w-md"
            />
            <button type="submit" className="bg-red-600 text-white px-6 py-2">
              GO
            </button>
          </form>

          <h2 className="text-2xl font-semibold mb-6">Upcoming Events</h2>

          {events.length === 0 ? (
            <p>No events found.</p>
          ) : (
            <div className="space-y-10">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex flex-col md:flex-row gap-6 border-b pb-8"
                >
                  <Link href={`/events/${event.slug}`}>
                    <div className="w-full md:w-60 flex-shrink-0">
                      {event.logoUrl ? (
                        <Image
                          src={event.logoUrl}
                          alt={event.title}
                          width={240}
                          height={140}
                          className="object-contain border"
                        />
                      ) : (
                        <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                          No Image
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">
                      {new Date(event.startDate).toLocaleDateString()} –{" "}
                      {new Date(event.endDate).toLocaleDateString()}
                    </p>

                    <h3 className="text-xl font-semibold mb-2">
                      <Link
                        href={`/events/${event.slug}`}
                        className="hover:underline"
                      >
                        {event.title}
                      </Link>
                    </h3>

                    <p className="text-gray-700 mb-2 line-clamp-3">
                      {event.description}
                    </p>

                    {event.location && (
                      <p className="text-sm text-gray-500">📍 {event.location}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="lg:col-span-4">
          <SupplierAds />
        </aside>
      </div>
    </div>
  )
}
