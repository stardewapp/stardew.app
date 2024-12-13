import { QuestionCard } from "@/components/cards/question-card";
import {
  IconBrandDiscord,
  IconNotebook,
  IconPencil,
  IconTrash,
  IconUpload,
} from "@tabler/icons-react";
import Head from "next/head";

const faq = [
  {
    question: "Can I edit my saves with stardew.app?",
    answer:
      "stardew.app is a perfection checklist, not a save file editor. While we allow you to upload your save files to the site, we do not store any more data than is needed to update you on your perfection status. We do not store your save file after upload and unfortunately cannot retrieve it for you.",
    icon: IconPencil,
  },
  {
    question: "How do I upload my save file?",
    answer:
      "To upload your save file, click on the 'Upload Save' button on the homepage. You will be prompted to select your save file from your computer. Once you have selected your save file, you will be able to see your progress on the homepage.",
    icon: IconUpload,
  },
  {
    question: "Can I track multiple save files?",
    answer:
      "Yes! You can track multiple save files by uploading each save file separately. You can switch between save files by clicking on the 'Switch Save' button on the homepage.",
    icon: IconPencil,
  },
  {
    question: "How do I track my progress?",
    answer:
      'There\'s two ways! You can either upload your save file to the site, or manually check off items as you collect them. You can manually complete items by clicking the item and selecting "Set Complete".',
    icon: IconNotebook,
  },
  {
    question: "Why do I need to login with Discord?",
    answer:
      "We use Discord to authenticate users to ensure that you are the only one who can access your save file data. We do not store any personal information from your Discord account.",
    icon: IconBrandDiscord,
  },
  {
    question: "How do I delete saved data?",
    answer:
      'You can delete your ALL saved data by clicking on "Delete Save Data" in the account dropdown - otherwise, you can head to Account Settings > Saves to delete a specific farmer.',
    icon: IconTrash,
  },
];

export default function FAQ() {
  return (
    <>
      <Head>
        <title>stardew.app | FAQ</title>
        <meta
          name="description"
          content="Frequently asked questions about stardew.app"
        />
      </Head>
      <main
        className={`flex min-h-screen border-neutral-200 px-5 pb-8 pt-2 dark:border-neutral-800 md:border-l md:px-8`}
      >
        <div className="mx-auto mt-4 space-y-4">
          <h1 className="ml-1 text-2xl font-semibold text-gray-900 dark:text-white">
            stardew.app FAQ
          </h1>
          <div className=" columns-1 gap-8 md:columns-3">
            {faq.map((item, index) => (
              <QuestionCard
                key={index}
                question={item.question}
                answer={item.answer}
                Icon={item.icon}
              />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
