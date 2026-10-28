"use server";

import { auth, signIn, signOut } from "./auth";
import { redirect } from "next/navigation";
import { getBookings, updateGuest } from "./data-service";
import { revalidatePath } from "next/cache";
import { supabase } from "./supabase";
export async function updateProfile(formData) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in");
  const nationalID = formData.get("nationalID");
  const [nationality, countryFlag] = formData.get("nationality").split("%");
  if (!/^[a-zA-Z0-9]{6,12}$/.test(nationalID))
    throw new Error("Please provide a valid national ID");

  const { data, error } = await supabase
    .from("guests")
    .update({ nationality, countryFlag, nationalID })
    .eq("id", session.user.guestId)
    .select();

  console.log("updated:", data);

  if (error) {
    console.error(error);
    throw new Error("Guest could not be updated");
  }

  revalidatePath("/account/profile");
}
//////////////////////////////
export async function createBooking(bookingData, formData) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  const newBooking = {
    ...bookingData,
    guestId: session.user.guestId,
    numGuests: Number(formData.get("numGuests")),
    observations: formData.get("observations").slice(0, 1000),
    extrasPrice: 0,
    totalPrice: bookingData.cabinPrice,
    isPaid: false,
    hasBreakfast: false,
    status: "unconfirmed",
  };
  const { error } = await supabase.from("bookings").insert([newBooking]);

  if (error) {
    console.error(error);
    throw new Error("Booking could not be created");
  }
  revalidatePath(`/cabins/${bookingData.cabinId}`);
  redirect("/thankyou");
}
export async function signInAction() {
  await signIn("google", { redirectTo: "/account" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
export async function updateReservation(formData) {
  console.log(formData);
  const session = await auth();
  if (!session) throw new Error("You must be logged in");
  const reservationId = Number(formData.get("reservationId"));
  const guestBookings = await getBookings(session.user.guestId);
  const guestBookingsIds = guestBookings.map((booking) => booking.id);
  if (!guestBookingsIds.includes(reservationId))
    throw new Error("You can't update this booking");
  const numGuests = formData.get("numGuests");
  const observations = formData.get("observations");
  const { data, error } = await supabase
    .from("bookings")
    .update({ numGuests, observations })
    .eq("id", reservationId)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error("Booking could not be updated");
  }
  revalidatePath("/account/reservations");
  redirect("/account/reservations");
}
export async function deleteReservation(bookingId) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in");
  const guestBookings = await getBookings(session.user.guestId);
  const guestBookingsIds = guestBookings.map((booking) => booking.id);
  if (!guestBookingsIds.includes(bookingId))
    throw new Error("You can't delete this booking");
  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", bookingId);
  if (error) throw new Error("Booking could not be deleted");
  revalidatePath("account/reservation");
}
