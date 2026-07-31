import { ModalDemo } from "./modal-demo";

export default function Home() {
  return (
    <main>
      <p className="eyebrow">REAL NEXT.JS CONSUMER</p>
      <h1>One modal API, including the web.</h1>
      <p className="intro">
        This fixture imports the built npm package, renders its portal, and
        resolves a backdrop dismissal in a Client Component.
      </p>
      <ModalDemo />
    </main>
  );
}
