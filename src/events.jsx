// Public events. Add new events to the top; they archive themselves after their date.
export const events = [
  {
    id: 'june17-2026',
    tag: 'event-june17',
    date: '2026-06-17',
    title: <>Raise a Pint for James /<br className="mobile-break" /> FIFA World Cup: England v Croatia</>,
    dateLabel: 'June 17th, 2026',
    location: 'The Draft Room, Toronto',
    mapUrl: 'https://maps.app.goo.gl/jQvTBCCPYnDG2CG96',
    calendarUrl: 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Raise+a+Pint+for+James&dates=20260617T160000/20260617T200000&location=The+Draft+Room%2C+395+Keele+St%2C+Toronto%2C+ON+M6P+2K9&details=Join+us+at+The+Draft+Room+%28395+Keele+St%2C+Toronto%29+to+raise+a+pint+for+James+on+what+would+have+been+his+49th+birthday.+England+v+Croatia+kicks+off+at+4pm+%28FIFA+World+Cup+2026%29.+We+have+a+reservation+from+4pm+and+plan+to+be+there+until+at+least+8pm.+Come+join+us+at+any+point+in+the+evening.+Bring+your+English+spirit.%0A%0Ahttps%3A%2F%2Flistenablemusic.ca%2F%23events',
    body: (
      <>
        <p>
          On what would have been James's 49th birthday, we'll gather at <a href="https://maps.app.goo.gl/jQvTBCCPYnDG2CG96" target="_blank" rel="noopener noreferrer">The Draft Room (395 Keele St, Toronto)</a>{' '}
          to watch the football and raise a pint in his name. We've got a reservation from 4pm and plan to be
          there for a few hours, until 8pm at least. Come join us at any point in the evening; if you can't make
          it until a little later, that's fine.
        </p>
        <p className="event-note">
          England v Croatia kicks off at 4pm (FIFA World Cup 2026). Bring your English spirit.
        </p>
      </>
    ),
  },
]

// Stays up through the day after the event, archives the day after that (local time).
export function isPast(date) {
  const [y, m, d] = date.split('-').map(Number)
  return new Date() >= new Date(y, m - 1, d + 2)
}
