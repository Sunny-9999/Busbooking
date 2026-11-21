# Booking flow code review

Scope is the existing Angular booking handler and Java inventory service. Findings below come from source inspection.

## High | Booking success is shown before either write completes

The click handler starts the booking request and the seat-update request in separate subscriptions. Both success callbacks are empty. It then shows the success alert immediately. A caller can see confirmation even if a request fails, and either write could succeed without the other. [Booking handler](../front-end-code/src/app/bus-booking/bus-booking.component.ts#L60-L74)

**Requested change** Put booking creation and seat reservation behind one server operation with a shared transaction. Show the success alert only after the server confirms the operation.

**Acceptance checks** Force each write to fail in turn. Verify that no partial booking or inventory change remains and that the UI shows an error. Verify that a successful request creates one booking, decrements inventory by the requested quantity, and confirms success once.

## High | Seat availability is updated with a read-modify-write

The inventory service loads the bus, subtracts the requested quantity, and saves the result. This method has no server-side sufficiency check or explicit concurrency guard. A quantity greater than remaining capacity can produce negative inventory. Concurrent requests can also make decisions from the same starting count. [Inventory service](../back-end-code/src/main/java/com/example/demo/services/BusServices.java#L39-L44)

**Requested change** Validate positive quantities and enforce capacity at the database write, for example with a conditional update. Have the booking operation treat an unsuccessful reservation as a failure before committing.

**Acceptance checks** With one seat left, submit two simultaneous one-seat requests. Verify one succeeds, inventory reaches zero, and only one booking persists. Also verify that an oversized request and a nonpositive quantity leave state intact.

## Medium | Search can retain buses from a previous query

The search overwrites matching entries by index but never truncates the array. Its zero-match condition also assigns zero to the counter. The focused case reproduces both effects and checks two candidate fixes. [Search evidence](search/README.md)
