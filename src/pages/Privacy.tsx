import { LegalPage, LegalSection, LegalList, ContactLine } from "@/components/LegalPage";
import { SITE } from "@/lib/site";

const Privacy = () => (
  <LegalPage title="Privacy policy">
    <LegalSection heading="Who we are">
      <p>
        {SITE.name} is a website that generates images of clothing on a person. This policy explains what
        information the site handles when you use it, why, and what choices you have.
      </p>
    </LegalSection>

    <LegalSection heading="What we handle">
      <LegalList>
        <li>
          <strong>Photos you add.</strong> This includes photos of yourself, photos of fabric or garments, and
          photos you take with your camera inside the site. A photo of you can show your face and body.
        </li>
        <li>
          <strong>Your selections.</strong> For example the outfit style, color, model type and body type you choose.
        </li>
        <li>
          <strong>Generated images.</strong> The try-on and model shot images created from your photos.
        </li>
        <li>
          <strong>Technical request data.</strong> Our hosting and backend providers receive standard request
          information such as your IP address, browser type and the time of the request.
        </li>
      </LegalList>
      <p>You do not need an account to use the site, and we do not ask for your name or email address in the tools.</p>
    </LegalSection>

    <LegalSection heading="How your photos are used">
      <p>
        When you press a generate button, your browser sends the photos and selections to our backend functions.
        Those functions pass them to a third party AI model provider, which creates the image and returns it to you.
        We use your photos only to produce the result you asked for.
      </p>
      <p>
        The Color match tool asks the AI provider to estimate a skin tone category from your photo and to suggest
        colors. The category is an estimate and is shown to you on screen.
      </p>
      <p>
        We do not build a profile of you, we do not sell your photos, and we do not use them to advertise to you.
      </p>
    </LegalSection>

    <LegalSection heading="Storage and retention">
      <p>
        The site does not save your photos or generated images in a database or file storage. They are held in your
        browser while the page is open and are gone when you close or reload the page. If you press Download, the
        image is saved to your own device.
      </p>
      <p>
        The AI provider that processes your request, and our hosting and backend providers, handle data under their
        own terms and may keep it for a limited time, for example in logs. We encourage you to read their policies.
      </p>
    </LegalSection>

    <LegalSection heading="Service providers">
      <LegalList>
        <li>Vercel, which hosts the website.</li>
        <li>Supabase, which runs the backend functions the site calls.</li>
        <li>A third party AI model provider, which generates images and analyses photos on request.</li>
      </LegalList>
      <p>These providers process data on our behalf to run the site.</p>
    </LegalSection>

    <LegalSection heading="Camera access">
      <p>
        The site asks your browser for camera access only after you press Use camera. You can deny the request or
        revoke it in your browser settings at any time. Camera video is not recorded. Only the single frame you
        choose to capture is kept, in your browser, until you use or discard it.
      </p>
    </LegalSection>

    <LegalSection heading="Cookies and browser storage">
      <p>
        The site does not use advertising or analytics cookies. When you pick a color on the Color match page, the
        site briefly stores that choice in your browser storage so the Try-on page can read it, then removes it.
        Fonts are served from this site, not from a third party.
      </p>
    </LegalSection>

    <LegalSection heading="Photos of other people and children">
      <p>
        Only add a photo of another person if they have agreed to it. The site is not meant for children under 13,
        and you should not add photos of children.
      </p>
    </LegalSection>

    <LegalSection heading="Your choices">
      <p>
        You can remove a photo from the page at any time with the Remove button, or close the page to clear
        everything held in your browser. If you have a question about your information, contact us.
      </p>
    </LegalSection>

    <LegalSection heading="Changes to this policy">
      <p>If we change this policy, we will update the date at the top of this page.</p>
    </LegalSection>

    <LegalSection heading="Contact">
      <p>Questions about this policy can be sent to us.</p>
      <ContactLine />
    </LegalSection>
  </LegalPage>
);

export default Privacy;
