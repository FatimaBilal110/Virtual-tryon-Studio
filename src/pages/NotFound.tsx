import { Link } from "react-router-dom";
import { Layout, PageIntro } from "@/components/Layout";

const NotFound = () => (
  <Layout title="Page not found">
    <PageIntro title="This page does not exist">
      <p>
        The address may be mistyped, or the page may have moved. <Link to="/" className="text-clay underline">Go to the try-on page</Link>.
      </p>
    </PageIntro>
  </Layout>
);

export default NotFound;
