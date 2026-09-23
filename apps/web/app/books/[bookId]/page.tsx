import { notFound } from "next/navigation";
import { getBook } from "@/lib/books";
import { BookReader } from "./reader";

export default function BookPage({ params }: { params: { bookId: string } }) {
  if (!getBook(params.bookId)) notFound();
  return <BookReader bookId={params.bookId} />;
}
