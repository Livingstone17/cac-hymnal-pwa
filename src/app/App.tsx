// import { useState, useEffect, type ReactNode, type ElementType } from "react";
// import { motion, AnimatePresence } from "motion/react";
// import {
//   Home, Search, Grid3X3, Heart, Settings,
//   Bell, ChevronLeft, ChevronRight, Share2, BookOpen,
//   X, Moon, Sun, Star, Music, GripVertical,
//   Hash, FileText, Info, Trash2, Globe, Clock,
// } from "lucide-react";

// // ── Types ─────────────────────────────────────────────────────────────────────

// type Screen = "onboarding" | "home" | "search" | "categories" | "category-detail" | "favorites" | "settings" | "hymn-detail";
// type Language = "en" | "yo";
// type Tab = "home" | "search" | "categories" | "favorites" | "settings";

// interface Verse { number: number; en: string[]; yo: string[]; }
// interface Hymn {
//   id: number; number: number;
//   titleEn: string; titleYo: string;
//   category: string; author?: string;
//   verses: Verse[];
//   chorus?: { en: string[]; yo: string[] };
// }
// interface CategoryDef {
//   id: string; nameEn: string; nameYo: string;
//   Icon: ElementType; hymnCount: number;
//   color: string; bg: string;
// }

// // ── Hymn Data ─────────────────────────────────────────────────────────────────

// const HYMNS: Hymn[] = [
//   {
//     id: 1, number: 1, titleEn: "Holy, Holy, Holy", titleYo: "Mímọ́ Mímọ́ Mímọ́",
//     category: "praise", author: "Reginald Heber",
//     verses: [
//       { number: 1,
//         en: ["Holy, holy, holy! Lord God Almighty!", "Early in the morning our song shall rise to Thee;", "Holy, holy, holy! Merciful and mighty!", "God in three Persons, blessèd Trinity!"],
//         yo: ["Mímọ́, mímọ́, mímọ́! Oluwa Ọlọ́run Gbogbogbò!", "Ní àárọ̀ ìmọ́lẹ̀ orin wa yóò dìde sí Ọ;", "Mímọ́, mímọ́, mímọ́! Oní àánú àti agbára!", "Ọlọ́run nínú Ènìyàn mẹ́ta, Mẹ́talọ́kan Mímọ́!"] },
//       { number: 2,
//         en: ["Holy, holy, holy! All the saints adore Thee,", "Casting down their golden crowns around the glassy sea;", "Cherubim and seraphim falling down before Thee,", "Which wert, and art, and evermore shall be."],
//         yo: ["Mímọ́, mímọ́, mímọ́! Gbogbo àwọn ẹni mímọ́ ń jọ́sìn Rẹ,", "Wọ́n ń ju àwọn ọkọ̀ wúrà wọn sí ìjìn òkun gíláàsì;", "Àwọn seraphim àti cherubim ń wolẹ̀ níwájú Rẹ,", "Ẹni tó wà, tó si wà, tó sì máa wà títí láé."] },
//       { number: 3,
//         en: ["Holy, holy, holy! Though the darkness hide Thee,", "Though the eye of sinful man Thy glory may not see;", "Only Thou art holy; there is none beside Thee,", "Perfect in power, in love, and purity."],
//         yo: ["Mímọ́, mímọ́, mímọ́! Bí ó tilẹ̀ jẹ́ pé òkùnkùn pamọ́ Ọ,", "Bí ó tilẹ̀ jẹ́ pé ojú ènìyàn alẹ̀ kò lè rí ògo Rẹ;", "Ìwọ nìkan ni mímọ́; kò sí ẹlòmíràn bí Ọ,", "Pé pélépélé nínú agbára, nínú ìfẹ́, àti mímọ́."] },
//     ],
//   },
//   {
//     id: 2, number: 2, titleEn: "Amazing Grace", titleYo: "Ìfẹ́ Àánú Iyanu",
//     category: "thanksgiving", author: "John Newton",
//     verses: [
//       { number: 1,
//         en: ["Amazing grace! How sweet the sound", "That saved a wretch like me!", "I once was lost, but now am found,", "Was blind, but now I see."],
//         yo: ["Ìfẹ́ àánú iyanu! Bí o ṣe dára tó ìró rẹ̀", "Tó gbàlà ẹni ìkà bí mi!", "Mo ṣínà lẹ́ẹ̀kan, ṣùgbọ́n a rí mi nísisìyí,", "Mo fọjú, ṣùgbọ́n Mo rí nísisìyí."] },
//       { number: 2,
//         en: ["'Twas grace that taught my heart to fear,", "And grace my fears relieved;", "How precious did that grace appear", "The hour I first believed!"],
//         yo: ["Ìfẹ́ àánú ló kọ ọkàn mi láti bẹ̀rù,", "Àti ìfẹ́ àánú tó yọ ibẹ̀rù mi kúrò;", "Bí ìfẹ́ àánú yẹn ṣe ní iye tó", "Nígbà tí mo gbà gbọ́ àkọ́kọ́!"] },
//       { number: 3,
//         en: ["Through many dangers, toils and snares,", "I have already come;", "'Tis grace hath brought me safe thus far,", "And grace will lead me home."],
//         yo: ["Nípasẹ̀ ọ̀pọ̀lọpọ̀ ewu, ìpọ́njú àti àwọn ọgọ,", "Mo ti kọjá tẹ́lẹ̀;", "Ìfẹ́ àánú ni ó mú mi wà ní ààbò títí di isisiyi,", "Àti ìfẹ́ àánú yóò mú mi padà sí ilé."] },
//     ],
//   },
//   {
//     id: 3, number: 3, titleEn: "What a Friend We Have in Jesus", titleYo: "Ọ̀rẹ́ Wa Ni Jésù",
//     category: "worship", author: "Joseph M. Scriven",
//     verses: [
//       { number: 1,
//         en: ["What a friend we have in Jesus,", "All our sins and griefs to bear!", "What a privilege to carry", "Everything to God in prayer!"],
//         yo: ["Ọ̀rẹ́ wo ni a ní nínú Jésù,", "Gbogbo ẹ̀ṣẹ̀ àti ìṣẹ̀ wa láti gbé!", "Ohun ìyanu wo ni ẹ̀tọ́ láti gbé", "Ohun gbogbo wá sí Ọlọ́run nínú ìjọ̀sìn!"] },
//       { number: 2,
//         en: ["Have we trials and temptations?", "Is there trouble anywhere?", "We should never be discouraged;", "Take it to the Lord in prayer."],
//         yo: ["Ṣé a ní àwọn ìdánwò àti ìdán?", "Ṣé ìṣòro wà níbikíbi?", "A kò gbọdọ̀ jẹ́ ki ìnira bà wá dẹ́nu;", "Gbé e lọ sọ fún Oluwa nínú ìjọ̀sìn."] },
//     ],
//   },
//   {
//     id: 4, number: 4, titleEn: "Abide With Me", titleYo: "Gbé Wà Pẹ̀lú Mi",
//     category: "worship", author: "Henry Francis Lyte",
//     verses: [
//       { number: 1,
//         en: ["Abide with me; fast falls the eventide;", "The darkness deepens; Lord, with me abide!", "When other helpers fail and comforts flee,", "Help of the helpless, oh, abide with me!"],
//         yo: ["Gbé wà pẹ̀lú mi; ìrọ̀lẹ́ yára bọ̀;", "Òkùnkùn ń jinlẹ̀; Oluwa, gbé wà pẹ̀lú mi!", "Nígbà tí àwọn olùrànlọ́wọ́ mìíràn kùnà àti ìtùnú sá,", "Olùrànlọ́wọ́ aláìníkòwò, jọ̀wọ́, gbé wà pẹ̀lú mi!"] },
//       { number: 2,
//         en: ["Swift to its close ebbs out life's little day;", "Earth's joys grow dim, its glories pass away;", "Change and decay in all around I see;", "O Thou who changest not, abide with me!"],
//         yo: ["Ọjọ́ igbésí ayé ń pín kánkán sẹ́hìn;", "Àwọn ayọ̀ ilẹ̀ ayé ń rẹwẹ̀sì, ògo rẹ̀ ń kọjá;", "Ìyípadà àti ìbàjẹ́ ni mo rí káàkiri;", "Ìwọ tó kò yípadà, gbé wà pẹ̀lú mi!"] },
//     ],
//   },
//   {
//     id: 5, number: 5, titleEn: "Great Is Thy Faithfulness", titleYo: "Ìgbẹ́kẹ̀lé Rẹ Tobi",
//     category: "thanksgiving", author: "Thomas O. Chisholm",
//     verses: [
//       { number: 1,
//         en: ["Great is Thy faithfulness, O God my Father,", "There is no shadow of turning with Thee;", "Thou changest not, Thy compassions they fail not,", "As Thou hast been, Thou forever will be."],
//         yo: ["Ìgbẹ́kẹ̀lé Rẹ̀ tóbi, Oluwa Bàbá mi,", "Kò sí ojiji ìyípadà nínú Rẹ;", "Ìwọ kò yípadà, àánú Rẹ kò kùnà,", "Bí o ti jẹ́, bẹ́ẹ̀ ni o máa jẹ́ títí láé."] },
//       { number: 2,
//         en: ["Summer and winter and springtime and harvest,", "Sun, moon and stars in their courses above,", "Join with all nature in manifold witness,", "To Thy great faithfulness, mercy and love."],
//         yo: ["Ìgbà ẹ̀ẹ̀rùn àti ìgbà òtútù, àkókò àkara àti ìkórè,", "Àwọn ìràwọ̀, òṣùpá àti oòrùn nínú ipa wọn lókè,", "Dara pọ̀ pẹ̀lú ẹ̀dá gbogbo nínú ẹ̀rí ọ̀pọ̀lọpọ̀,", "Fún ìgbẹ́kẹ̀lé, àánú àti ìfẹ́ Rẹ tóbi."] },
//     ],
//     chorus: {
//       en: ["Great is Thy faithfulness! Great is Thy faithfulness!", "Morning by morning new mercies I see;", "All I have needed Thy hand hath provided,", "Great is Thy faithfulness, Lord, unto me!"],
//       yo: ["Ìgbẹ́kẹ̀lé Rẹ tóbi! Ìgbẹ́kẹ̀lé Rẹ tóbi!", "Òwúrọ̀ tí ó ń mọ́ àwọn àánú tuntun ni mo rí;", "Ohun gbogbo tí mo nílò ọwọ́ Rẹ ti pèsè,", "Ìgbẹ́kẹ̀lé Rẹ tóbi, Oluwa, sí mi!"],
//     },
//   },
//   {
//     id: 6, number: 6, titleEn: "To God Be the Glory", titleYo: "Ọlọ́run Ni Ògo",
//     category: "praise", author: "Fanny Crosby",
//     verses: [
//       { number: 1,
//         en: ["To God be the glory, great things He hath taught us,", "Great things He hath done, and great our rejoicing", "Through Jesus the Son; but purer and higher", "And greater our wonder, our transport, when Jesus we see."],
//         yo: ["Ọlọ́run ni ògo, ó ti kọ wa ọ̀pọ̀ nǹkan ńlá,", "Ó ti ṣe àwọn nǹkan ńlá, àti ayọ̀ wa ńlá", "Nípasẹ̀ Jésù Ọmọ naa; ṣùgbọ́n mímọ́ tó ga jù", "Àti iyanu wa yóò tobi jù nígbà ti a bá rí Jésù."] },
//     ],
//     chorus: {
//       en: ["Praise the Lord, praise the Lord,", "Let the earth hear His voice!", "Praise the Lord, praise the Lord,", "Let the people rejoice!"],
//       yo: ["Yìn Oluwa, yìn Oluwa,", "Jẹ́ kí ilẹ̀ gbọ́ ohùn Rẹ!", "Yìn Oluwa, yìn Oluwa,", "Jẹ́ kí àwọn ènìyàn yọ̀!"],
//     },
//   },
//   {
//     id: 7, number: 7, titleEn: "Blessed Assurance", titleYo: "Ìdánimọ̀ Àlàáfíà",
//     category: "worship", author: "Fanny Crosby",
//     verses: [
//       { number: 1,
//         en: ["Blessed assurance, Jesus is mine!", "Oh, what a foretaste of glory divine!", "Heir of salvation, purchase of God,", "Born of His Spirit, washed in His blood."],
//         yo: ["Ìdánimọ̀ àlàáfíà, Jésù jẹ́ tèmi!", "Ó, kí ìjẹlọ́pọ̀ ògo àtọ̀runwá!", "Arọ́pọ̀ ìgbàlà, ìrà Ọlọ́run,", "Tí a bí nínú Ẹmí Rẹ, tí a wẹ nínú ẹjẹ Rẹ."] },
//     ],
//     chorus: {
//       en: ["This is my story, this is my song,", "Praising my Savior all the day long;", "This is my story, this is my song,", "Praising my Savior all the day long."],
//       yo: ["Èyí ni ìtàn mi, èyí ni orin mi,", "Ní ìyìn Olùgbàlà mi gbogbo ọjọ́;", "Èyí ni ìtàn mi, èyí ni orin mi,", "Ní ìyìn Olùgbàlà mi gbogbo ọjọ́."],
//     },
//   },
//   {
//     id: 8, number: 8, titleEn: "How Great Thou Art", titleYo: "Bí O Ṣe Ńlá Tó",
//     category: "praise", author: "Carl Gustav Boberg",
//     verses: [
//       { number: 1,
//         en: ["O Lord my God, when I in awesome wonder", "Consider all the worlds Thy hands have made,", "I see the stars, I hear the rolling thunder,", "Thy power throughout the universe displayed."],
//         yo: ["Oluwa Ọlọ́run mi, nígbà tí mo ń ṣàkíyèsí pẹ̀lú ìyàlẹ́nu", "Gbogbo àwọn ayé tí ọwọ́ Rẹ ṣe,", "Mo rí àwọn ìràwọ̀, mo gbọ́ àrá ìgbìmọ̀,", "Agbára Rẹ tí a fihàn gbogbo àgbáálá ayé."] },
//     ],
//     chorus: {
//       en: ["Then sings my soul, my Savior God, to Thee:", "How great Thou art, how great Thou art!", "Then sings my soul, my Savior God, to Thee:", "How great Thou art, how great Thou art!"],
//       yo: ["Nígbà náà ọkàn mi ń korin, Ọlọ́run Olùgbàlà mi, sí Ọ:", "Bí o ṣe ńlá tó, bí o ṣe ńlá tó!", "Nígbà náà ọkàn mi ń korin, Ọlọ́run Olùgbàlà mi, sí Ọ:", "Bí o ṣe ńlá tó, bí o ṣe ńlá tó!"],
//     },
//   },
//   {
//     id: 9, number: 9, titleEn: "Rock of Ages", titleYo: "Àpáta Àwọn Ọjọ́ Ayé",
//     category: "communion", author: "Augustus Toplady",
//     verses: [
//       { number: 1,
//         en: ["Rock of Ages, cleft for me,", "Let me hide myself in Thee;", "Let the water and the blood,", "From Thy wounded side which flowed,"],
//         yo: ["Àpáta Àwọn Ọjọ́ Ayé, tí a ya fún mi,", "Jẹ́ kí n pa ara mi mọ́ nínú Rẹ;", "Jẹ́ kí omi àti ẹjẹ,", "Tí ó ń ṣàn láti ẹgbẹ́ tí a gbé gún Rẹ,"] },
//       { number: 2,
//         en: ["Not the labors of my hands", "Can fulfill Thy law's demands;", "Could my zeal no respite know,", "Could my tears forever flow,"],
//         yo: ["Kìí ṣe iṣẹ́ àwọn ọwọ́ mi", "Tí ó lè ṣe ohun tí òfin Rẹ béèrè;", "Bí ìfẹ́kúfẹ̀ẹ́ mi bá kò mọ̀ isinmi,", "Bí omijé mi bá ń ṣàn títí láí,"] },
//     ],
//   },
//   {
//     id: 10, number: 10, titleEn: "It Is Well with My Soul", titleYo: "Ọkàn Mi Wà Ní Àlàáfíà",
//     category: "thanksgiving", author: "Horatio Spafford",
//     verses: [
//       { number: 1,
//         en: ["When peace like a river attendeth my way,", "When sorrows like sea billows roll;", "Whatever my lot, Thou hast taught me to say,", "It is well, it is well with my soul."],
//         yo: ["Nígbà tí àlàáfíà bí odò ń tẹ̀lé ọ̀nà mi,", "Nígbà tí ìbànújẹ́ bí ìgbi okun ń yí káàkiri;", "Irú ipò tí mo bá wà, Ìwọ ti kọ mi láti sọ,", "Ọkàn mi wà ní àlàáfíà, ọkàn mi wà ní àlàáfíà."] },
//     ],
//     chorus: {
//       en: ["It is well (it is well),", "With my soul (with my soul),", "It is well, it is well with my soul."],
//       yo: ["Ọkàn mi wà ní àlàáfíà (ọkàn mi wà ní àlàáfíà),", "Pẹ̀lú ọkàn mi (pẹ̀lú ọkàn mi),", "Ọkàn mi wà ní àlàáfíà, ọkàn mi wà ní àlàáfíà."],
//     },
//   },
//   {
//     id: 11, number: 11, titleEn: "Just As I Am", titleYo: "Gẹ́gẹ́ Bí Mo Ṣe Jẹ́",
//     category: "processional", author: "Charlotte Elliott",
//     verses: [
//       { number: 1,
//         en: ["Just as I am, without one plea,", "But that Thy blood was shed for me,", "And that Thou bidd'st me come to Thee,", "O Lamb of God, I come, I come!"],
//         yo: ["Gẹ́gẹ́ bí mo ṣe jẹ́, láìsí àríyànjiyàn kan,", "Ṣùgbọ́n pé ẹjẹ Rẹ ni a ta sílẹ̀ fún mi,", "Àti pé Ìwọ pè mí wá sọ́dọ̀ Rẹ,", "Ọ̀dọ́bọ Ọlọ́run, mo wá, mo wá!"] },
//       { number: 2,
//         en: ["Just as I am, and waiting not", "To rid my soul of one dark blot,", "To Thee whose blood can cleanse each spot,", "O Lamb of God, I come, I come!"],
//         yo: ["Gẹ́gẹ́ bí mo ṣe jẹ́, laisi dúró", "Láti yọ ọkàn mi kúrò nínú ọkàn dudu kan,", "Sí Rẹ ẹni tí ẹjẹ Rẹ lè mọ́ gbogbo ojú,", "Ọ̀dọ́bọ Ọlọ́run, mo wá, mo wá!"] },
//     ],
//   },
//   {
//     id: 12, number: 12, titleEn: "O For a Thousand Tongues", titleYo: "O Fún Ẹgbẹ̀rún Ahọn",
//     category: "praise", author: "Charles Wesley",
//     verses: [
//       { number: 1,
//         en: ["O for a thousand tongues to sing", "My great Redeemer's praise,", "The glories of my God and King,", "The triumphs of His grace!"],
//         yo: ["O fún ẹgbẹ̀rún ahọn láti korin", "Ìyin Olùgbàlà mi ńlá,", "Àwọn ògo Ọlọ́run mi àti Ọba,", "Àwọn ìṣẹ́gun ìfẹ́ àánú Rẹ!"] },
//       { number: 2,
//         en: ["My gracious Master and my God,", "Assist me to proclaim,", "To spread through all the earth abroad,", "The honors of Thy name."],
//         yo: ["Olúwa mi oní ìfẹ́ àánú àti Ọlọ́run mi,", "Ràn mí lọ́wọ́ láti kéde,", "Láti tan káàkiri ilẹ̀ ayé,", "Àwọn ọlá ti orúkọ Rẹ."] },
//     ],
//   },
// ];

// const CATEGORIES: CategoryDef[] = [
//   { id: "praise",       nameEn: "Praise",        nameYo: "Ìyin",         Icon: Star,     hymnCount: 24, color: "#B8860B", bg: "#FDF3DC" },
//   { id: "worship",      nameEn: "Worship",        nameYo: "Ìjọ̀sìn",      Icon: Music,    hymnCount: 31, color: "#1A237E", bg: "#E8EAFB" },
//   { id: "thanksgiving", nameEn: "Thanksgiving",   nameYo: "Ìdúpẹ́",       Icon: Heart,    hymnCount: 18, color: "#2E7D32", bg: "#E8F5E9" },
//   { id: "communion",    nameEn: "Communion",      nameYo: "Àjọ́pín",      Icon: BookOpen, hymnCount: 12, color: "#6A1B9A", bg: "#F3E5F5" },
//   { id: "processional", nameEn: "Processional",   nameYo: "Ìlọ Síwájú",  Icon: ChevronRight, hymnCount: 9, color: "#C62828", bg: "#FFEBEE" },
//   { id: "christmas",    nameEn: "Christmas",      nameYo: "Ìbí Krístì",   Icon: Star,     hymnCount: 15, color: "#00838F", bg: "#E0F7FA" },
//   { id: "easter",       nameEn: "Easter",         nameYo: "Àjíǹde",       Icon: Sun,      hymnCount: 11, color: "#E65100", bg: "#FBE9E7" },
//   { id: "funeral",      nameEn: "Funeral",        nameYo: "Ìsìnkú",       Icon: Moon,     hymnCount: 8,  color: "#37474F", bg: "#ECEFF1" },
// ];

// // ── Shared UI Components ──────────────────────────────────────────────────────

// function HymnBookLogo({ size = 40, light = false }: { size?: number; light?: boolean }) {
//   const stroke = light ? "white" : "#1A237E";
//   return (
//     <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
//       <path d="M24 10 C18 10 7 12 5 15 L5 41 C7 38 18 37 24 37" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//       <path d="M24 10 C30 10 41 12 43 15 L43 41 C41 38 30 37 24 37" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//       <line x1="24" y1="10" x2="24" y2="37" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
//       <line x1="34.5" y1="17" x2="34.5" y2="33" stroke="#D4A017" strokeWidth="2.5" strokeLinecap="round" />
//       <line x1="28" y1="23" x2="41" y2="23" stroke="#D4A017" strokeWidth="2.5" strokeLinecap="round" />
//     </svg>
//   );
// }

// function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
//   return (
//     <button
//       onClick={onToggle}
//       className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${on ? "bg-primary" : "bg-muted"}`}
//     >
//       <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${on ? "left-7" : "left-1"}`} />
//     </button>
//   );
// }

// function SettingsSection({ title, icon: Icon, children }: { title: string; icon: ElementType; children: ReactNode }) {
//   return (
//     <div className="bg-card border border-border rounded-2xl overflow-hidden">
//       <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/40">
//         <Icon className="w-3.5 h-3.5 text-primary" />
//         <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{title}</span>
//       </div>
//       <div className="px-4 py-3">{children}</div>
//     </div>
//   );
// }

// function ResultGroup({
//   title, icon: Icon, hymns, query, language, onOpen,
// }: {
//   title: string; icon: ElementType; hymns: Hymn[]; query: string;
//   language: Language; onOpen: (h: Hymn) => void;
// }) {
//   return (
//     <div>
//       <div className="flex items-center gap-2 mb-2">
//         <Icon className="w-3 h-3 text-muted-foreground" />
//         <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{title}</span>
//       </div>
//       <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
//         {hymns.slice(0, 4).map(hymn => {
//           const matchLine = hymn.verses.flatMap(v => [...v.en, ...v.yo]).find(l => l.toLowerCase().includes(query.toLowerCase()));
//           return (
//             <button key={hymn.id} onClick={() => onOpen(hymn)} className="w-full p-3 hover:bg-muted/50 transition-colors text-left">
//               <div className="flex items-center gap-3">
//                 <span className="text-[#D4A017] font-black text-sm w-8 flex-shrink-0">
//                   {hymn.number.toString().padStart(3, "0")}
//                 </span>
//                 <div className="flex-1 min-w-0">
//                   <div className="flex items-baseline gap-1.5 flex-wrap">
//                     <span className="text-foreground text-sm font-semibold">{hymn.titleEn}</span>
//                     <span className="text-muted-foreground text-xs">· {hymn.titleYo}</span>
//                   </div>
//                   {matchLine && (
//                     <p className="text-muted-foreground text-xs mt-0.5 truncate italic">{matchLine}</p>
//                   )}
//                 </div>
//                 <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
//               </div>
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// // ── Main App ──────────────────────────────────────────────────────────────────

// export default function App() {
//   const [screen, setScreen] = useState<Screen>("onboarding");
//   const [prevScreen, setPrevScreen] = useState<Screen>("home");
//   const [activeTab, setActiveTab] = useState<Tab>("home");
//   const [language, setLanguage] = useState<Language>("en");
//   const [hymnLang, setHymnLang] = useState<Language>("en");
//   const [selectedHymn, setSelectedHymn] = useState<Hymn | null>(null);
//   const [selectedCategory, setSelectedCategory] = useState<CategoryDef | null>(null);
//   const [favorites, setFavorites] = useState<number[]>([5, 2, 8]);
//   const [recentlyViewed, setRecentlyViewed] = useState<number[]>([1, 3, 5, 8, 10]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [recentSearches, setRecentSearches] = useState(["Amazing Grace", "Holy Holy Holy", "Psalm 91"]);
//   const [darkMode, setDarkMode] = useState(false);
//   const [fontSize, setFontSize] = useState(16);
//   const [showDevotional, setShowDevotional] = useState(false);
//   const [heartPulse, setHeartPulse] = useState(false);
//   const [reminderEnabled, setReminderEnabled] = useState(true);
//   const [reminderTime, setReminderTime] = useState("06:00");
//   const [settingsLang, setSettingsLang] = useState<"en" | "yo" | "auto">("en");
//   const [metaExpanded, setMetaExpanded] = useState(false);
//   const [swipedFavId, setSwipedFavId] = useState<number | null>(null);
//   const [onboardLang, setOnboardLang] = useState<Language>("en");

//   useEffect(() => {
//     document.documentElement.classList.toggle("dark", darkMode);
//   }, [darkMode]);

//   useEffect(() => {
//     if (screen === "home") {
//       const t = setTimeout(() => setShowDevotional(true), 1800);
//       return () => clearTimeout(t);
//     }
//   }, [screen]);

//   const tr = (en: string, yo: string) => language === "en" ? en : yo;

//   const hymnTitle = (h: Hymn, lang?: Language) => (lang ?? language) === "en" ? h.titleEn : h.titleYo;

//   const openHymn = (hymn: Hymn, from?: Screen) => {
//     setPrevScreen(from ?? screen);
//     setSelectedHymn(hymn);
//     setHymnLang(language);
//     setMetaExpanded(false);
//     setRecentlyViewed(prev => [hymn.id, ...prev.filter(id => id !== hymn.id)].slice(0, 8));
//     setScreen("hymn-detail");
//   };

//   const goBack = () => {
//     setScreen(prevScreen);
//     setSelectedHymn(null);
//     if (["home","search","categories","category-detail","favorites","settings"].includes(prevScreen)) {
//       const tabMap: Record<string, Tab> = {
//         home: "home", search: "search", categories: "categories",
//         "category-detail": "categories", favorites: "favorites", settings: "settings",
//       };
//       setActiveTab(tabMap[prevScreen] ?? "home");
//     }
//   };

//   const navigateTab = (tab: Tab) => {
//     setActiveTab(tab);
//     const m: Record<Tab, Screen> = {
//       home: "home", search: "search", categories: "categories",
//       favorites: "favorites", settings: "settings",
//     };
//     setScreen(m[tab]);
//     setSelectedHymn(null);
//     setSelectedCategory(null);
//   };

//   const toggleFavorite = (id: number) => {
//     setHeartPulse(true);
//     setTimeout(() => setHeartPulse(false), 700);
//     setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
//   };

//   const hymnOfTheDay = HYMNS[(new Date().getDay() + new Date().getDate()) % HYMNS.length];
//   const recentHymns = recentlyViewed.map(id => HYMNS.find(h => h.id === id)).filter(Boolean) as Hymn[];
//   const favoriteHymns = favorites.map(id => HYMNS.find(h => h.id === id)).filter(Boolean) as Hymn[];

//   const searchResults = searchQuery.trim()
//     ? HYMNS.filter(h => {
//         const q = searchQuery.toLowerCase();
//         return (
//           h.number.toString().includes(q) ||
//           h.titleEn.toLowerCase().includes(q) ||
//           h.titleYo.toLowerCase().includes(q) ||
//           h.verses.some(v => [...v.en, ...v.yo].some(l => l.toLowerCase().includes(q)))
//         );
//       })
//     : [];

//   const byNumber = searchResults.filter(h => h.number.toString().includes(searchQuery));
//   const byTitle  = searchResults.filter(h => h.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) || h.titleYo.toLowerCase().includes(searchQuery.toLowerCase()));
//   const byLyrics = searchResults.filter(h => h.verses.some(v => [...v.en, ...v.yo].some(l => l.toLowerCase().includes(searchQuery.toLowerCase()))));

//   const showBottomNav = screen !== "onboarding" && screen !== "hymn-detail";

//   // ── Status Bar ───────────────────────────────────────────────────────────────
//   const StatusBar = () => (
//     <div className="flex items-center justify-between px-6 pt-3 pb-1 flex-shrink-0">
//       <span className="text-xs font-semibold text-foreground">9:41</span>
//       <div className="flex items-center gap-1 text-foreground">
//         <svg width="13" height="10" viewBox="0 0 13 10" fill="currentColor">
//           <rect x="0" y="7" width="2" height="3" rx="0.5" />
//           <rect x="3" y="5" width="2" height="5" rx="0.5" />
//           <rect x="6" y="3" width="2" height="7" rx="0.5" />
//           <rect x="9" y="0" width="2" height="10" rx="0.5" />
//         </svg>
//         <svg width="15" height="11" viewBox="0 0 15 11" fill="currentColor">
//           <path d="M7.5 8.5a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4z" />
//           <path d="M5 6C5.7 5.3 6.6 4.9 7.5 4.9s1.8.4 2.5 1.1" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
//           <path d="M2.5 3.5C4.1 1.9 5.7 1.1 7.5 1.1s3.4.8 5 2.4" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.6" />
//         </svg>
//         <svg width="22" height="11" viewBox="0 0 22 11" fill="currentColor">
//           <rect x="0" y="1" width="18" height="9" rx="2" stroke="currentColor" strokeWidth="1.2" fill="none" />
//           <rect x="18.8" y="3.5" width="2.2" height="4" rx="1" opacity="0.5" />
//           <rect x="1.5" y="2.5" width="13" height="6" rx="1.2" />
//         </svg>
//       </div>
//     </div>
//   );

//   // ── Bottom Nav ───────────────────────────────────────────────────────────────
//   const BottomNav = () => {
//     const tabs: { id: Tab; Icon: ElementType; en: string; yo: string }[] = [
//       { id: "home",       Icon: Home,     en: "Home",       yo: "Ilé" },
//       { id: "search",     Icon: Search,   en: "Search",     yo: "Ìwádìí" },
//       { id: "categories", Icon: Grid3X3,  en: "Categories", yo: "Ẹ̀ka" },
//       { id: "favorites",  Icon: Heart,    en: "Favorites",  yo: "Àyọ̀ Mi" },
//       { id: "settings",   Icon: Settings, en: "Settings",   yo: "Ìtòlẹ́sẹẹ̀" },
//     ];
//     return (
//       <div className="flex items-center justify-around px-1 py-2 border-t border-border bg-card flex-shrink-0">
//         {tabs.map(({ id, Icon, en, yo }) => {
//           const active = activeTab === id;
//           return (
//             <button key={id} onClick={() => navigateTab(id)} className="flex flex-col items-center gap-0.5 px-2 py-1">
//               <div className="relative">
//                 <Icon className={`w-[22px] h-[22px] transition-colors ${active ? "text-primary" : "text-muted-foreground"}`} />
//                 {id === "favorites" && favorites.length > 0 && (
//                   <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-[#D4A017] rounded-full text-[8px] flex items-center justify-center text-white font-bold leading-none">
//                     {favorites.length}
//                   </span>
//                 )}
//               </div>
//               <span className={`text-[9px] font-semibold leading-none transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}>
//                 {language === "en" ? en : yo}
//               </span>
//               {active && <div className="w-1 h-1 rounded-full bg-[#D4A017] mt-0.5" />}
//             </button>
//           );
//         })}
//       </div>
//     );
//   };

//   // ── Screen: Onboarding ───────────────────────────────────────────────────────
//   const renderOnboarding = () => (
//     <div className="flex flex-col h-full relative overflow-hidden" style={{ background: "linear-gradient(160deg, #1A237E 0%, #283593 60%, #1565C0 100%)" }}>
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/5" />
//         <div className="absolute top-1/2 -left-20 w-56 h-56 rounded-full bg-white/5" />
//         <div className="absolute bottom-1/3 right-4 w-40 h-40 rounded-full" style={{ background: "rgba(212,160,23,0.15)" }} />
//         <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/20 to-transparent" />
//       </div>

//       <div className="relative flex flex-col items-center justify-center flex-1 px-8 gap-7 pt-8">
//         <motion.div
//           initial={{ scale: 0.7, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           transition={{ duration: 0.6, ease: "easeOut" }}
//           className="w-28 h-28 rounded-[32px] flex items-center justify-center"
//           style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(12px)", border: "1.5px solid rgba(255,255,255,0.2)" }}
//         >
//           <HymnBookLogo size={64} light />
//         </motion.div>

//         <motion.div
//           initial={{ y: 20, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           transition={{ duration: 0.5, delay: 0.2 }}
//           className="text-center"
//         >
//           <h1 className="text-[26px] font-bold text-white tracking-tight leading-tight">CAC Gospel Hymnal</h1>
//           <p className="text-white/60 text-sm mt-1 font-medium">Christ Apostolic Church</p>
//         </motion.div>

//         <motion.p
//           initial={{ y: 16, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           transition={{ duration: 0.5, delay: 0.35 }}
//           className="text-white/75 text-center text-sm leading-relaxed max-w-[270px]"
//         >
//           {onboardLang === "en"
//             ? "Sing praises to the Lord with over 500 hymns in English and Yoruba."
//             : "Korin orin ìyin sí Oluwa pẹ̀lú orin 500+ ní Gẹ̀ẹ́sì àti Yorùbá."}
//         </motion.p>

//         <motion.div
//           initial={{ y: 16, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           transition={{ duration: 0.5, delay: 0.5 }}
//           className="w-full"
//         >
//           <p className="text-white/50 text-[10px] text-center mb-2.5 uppercase tracking-[0.15em] font-semibold">Choose Language</p>
//           <div className="flex rounded-2xl overflow-hidden border p-1 gap-1" style={{ borderColor: "rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.1)" }}>
//             {(["en", "yo"] as Language[]).map(lang => (
//               <button
//                 key={lang}
//                 onClick={() => setOnboardLang(lang)}
//                 className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
//                   onboardLang === lang ? "bg-white text-[#1A237E] shadow-md" : "text-white/70 hover:text-white"
//                 }`}
//               >
//                 {lang === "en" ? "🇬🇧  English" : "🇳🇬  Yorùbá"}
//               </button>
//             ))}
//           </div>
//         </motion.div>
//       </div>

//       <motion.div
//         initial={{ y: 30, opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         transition={{ duration: 0.5, delay: 0.65 }}
//         className="relative px-6 pb-10"
//       >
//         <button
//           onClick={() => { setLanguage(onboardLang); setSettingsLang(onboardLang); setScreen("home"); setActiveTab("home"); }}
//           className="w-full py-4 rounded-2xl font-bold text-[15px] shadow-xl active:scale-95 transition-transform"
//           style={{ background: "#D4A017", color: "#1A1A2E" }}
//         >
//           {onboardLang === "en" ? "Get Started →" : "Bẹ̀rẹ̀ Sísinú →"}
//         </button>
//         <p className="text-white/35 text-[11px] text-center mt-3">
//           {onboardLang === "en" ? "You can change language in Settings anytime" : "O le yipada èdè ninu Ètò ni igba eyikeyi"}
//         </p>
//       </motion.div>
//     </div>
//   );

//   // ── Screen: Home ─────────────────────────────────────────────────────────────
//   const renderHome = () => (
//     <div className="flex flex-col h-full">
//       <div className="flex items-center justify-between px-5 pt-1 pb-3 flex-shrink-0">
//         <div className="flex items-center gap-2.5">
//           <HymnBookLogo size={30} />
//           <div>
//             <p className="text-[10px] text-muted-foreground leading-none font-medium uppercase tracking-wider">CAC Gospel Hymnal</p>
//             <p className="text-sm font-bold text-foreground leading-tight mt-0.5">
//               {tr("Good Morning ☀️", "Ẹ káàárọ̀ ☀️")}
//             </p>
//           </div>
//         </div>
//         <button
//           onClick={() => setShowDevotional(true)}
//           className="relative w-9 h-9 rounded-full bg-muted flex items-center justify-center"
//         >
//           <Bell className="w-[18px] h-[18px] text-foreground" />
//           <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: "#D4A017" }} />
//         </button>
//       </div>

//       <div className="flex-1 overflow-y-auto pb-3 space-y-5" style={{ scrollbarWidth: "none" }}>
//         {/* Hymn of the Day */}
//         <div className="px-4">
//           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em] mb-2">
//             {tr("Hymn of the Day", "Orin Ọjọ Oni")}
//           </p>
//           <div className="rounded-[20px] bg-primary overflow-hidden relative">
//             <div className="absolute right-3 top-3 opacity-[0.07]">
//               <svg width="90" height="90" viewBox="0 0 48 48" fill="white">
//                 <path d="M24 8 C16 8 5 11 3 14 L3 43 C5 40 16 38 24 38 C32 38 43 40 45 43 L45 14 C43 11 32 8 24 8Z" />
//                 <line x1="24" y1="8" x2="24" y2="38" strokeWidth="3" stroke="white" />
//               </svg>
//             </div>
//             <div className="relative p-5">
//               <div className="flex items-start justify-between mb-3">
//                 <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold"
//                   style={{ background: "rgba(212,160,23,0.25)", color: "#D4A017", border: "1px solid rgba(212,160,23,0.35)" }}>
//                   <Star className="w-3 h-3 fill-current" />
//                   {tr("Featured", "Àkọ́ Orin")}
//                 </span>
//                 <span className="text-white/20 text-4xl font-black leading-none">
//                   #{hymnOfTheDay.number.toString().padStart(3, "0")}
//                 </span>
//               </div>
//               <h3 className="text-[20px] font-bold text-white leading-snug">{hymnTitle(hymnOfTheDay)}</h3>
//               <p className="text-white/55 text-xs mt-1.5 mb-4 line-clamp-2 leading-relaxed">
//                 {hymnOfTheDay.verses[0][language === "en" ? "en" : "yo"][0]}
//               </p>
//               <div className="flex items-center gap-3">
//                 <button
//                   onClick={() => openHymn(hymnOfTheDay, "home")}
//                   className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold shadow-md active:scale-95 transition-transform"
//                   style={{ background: "#D4A017", color: "#1A1A2E" }}
//                 >
//                   <Music className="w-4 h-4" />
//                   {tr("Sing Now", "Korin Báyìí")}
//                 </button>
//                 <span className="text-white/40 text-xs capitalize">{hymnOfTheDay.author ?? ""}</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Recently Viewed */}
//         {recentHymns.length > 0 && (
//           <div>
//             <div className="flex items-center justify-between px-4 mb-2">
//               <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em]">
//                 {tr("Recently Viewed", "Tí a Ṣẹ̀ṣẹ̀ Wò")}
//               </p>
//               <button className="text-[11px] font-semibold" style={{ color: "#1A237E" }}>
//                 {tr("See all", "Wo gbogbo")}
//               </button>
//             </div>
//             <div className="flex gap-2.5 px-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
//               {recentHymns.map(hymn => (
//                 <button
//                   key={hymn.id}
//                   onClick={() => openHymn(hymn, "home")}
//                   className="flex-shrink-0 w-[108px] bg-card border border-border rounded-2xl p-3 text-left active:scale-95 transition-transform"
//                 >
//                   <span className="text-[11px] font-black" style={{ color: "#D4A017" }}>
//                     #{hymn.number.toString().padStart(3, "0")}
//                   </span>
//                   <p className="text-foreground text-xs font-semibold mt-1 line-clamp-2 leading-snug">
//                     {hymnTitle(hymn)}
//                   </p>
//                   <p className="text-muted-foreground text-[10px] mt-1 capitalize">{hymn.category}</p>
//                 </button>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Quick Access */}
//         <div className="px-4">
//           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em] mb-3">
//             {tr("Quick Access", "Ìráàyèsí Iyára")}
//           </p>
//           <div className="grid grid-cols-2 gap-2.5">
//             {[
//               { Icon: BookOpen, en: "All Hymns", yo: "Gbogbo Orin", color: "#1A237E", bg: "#E8EAFB", action: () => navigateTab("categories") },
//               { Icon: Heart,    en: "Favorites",  yo: "Àyọ̀ Mi",     color: "#C62828", bg: "#FFEBEE", action: () => navigateTab("favorites") },
//               { Icon: Grid3X3,  en: "Categories", yo: "Ẹ̀ka",        color: "#2E7D32", bg: "#E8F5E9", action: () => navigateTab("categories") },
//               { Icon: Search,   en: "Search",     yo: "Ìwádìí",      color: "#B8860B", bg: "#FDF3DC", action: () => navigateTab("search") },
//             ].map(({ Icon, en, yo, color, bg, action }) => (
//               <button
//                 key={en}
//                 onClick={action}
//                 className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 active:scale-95 transition-all text-left hover:border-primary/20"
//               >
//                 <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
//                   <Icon className="w-5 h-5" style={{ color }} />
//                 </div>
//                 <span className="text-[13px] font-semibold text-foreground">{language === "en" ? en : yo}</span>
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Hymn List Preview */}
//         <div className="px-4 pb-2">
//           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em] mb-2">
//             {tr("Browse Hymns", "Ìwò Àwọn Orin")}
//           </p>
//           <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
//             {HYMNS.slice(0, 6).map(hymn => (
//               <button
//                 key={hymn.id}
//                 onClick={() => openHymn(hymn, "home")}
//                 className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
//               >
//                 <span className="font-black text-sm w-9 flex-shrink-0" style={{ color: "#D4A017" }}>
//                   {hymn.number.toString().padStart(3, "0")}
//                 </span>
//                 <div className="flex-1 min-w-0">
//                   <p className="text-foreground text-sm font-semibold truncate">{hymnTitle(hymn)}</p>
//                   <p className="text-muted-foreground text-[11px] truncate">
//                     {language === "en" ? hymn.titleYo : hymn.titleEn}
//                   </p>
//                 </div>
//                 <div className="flex items-center gap-1.5">
//                   {favorites.includes(hymn.id) && <Heart className="w-3.5 h-3.5 text-red-400 fill-current" />}
//                   <ChevronRight className="w-4 h-4 text-muted-foreground" />
//                 </div>
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   // ── Screen: Hymn Detail ──────────────────────────────────────────────────────
//   const renderHymnDetail = () => {
//     if (!selectedHymn) return null;
//     const isFav = favorites.includes(selectedHymn.id);
//     const hl = hymnLang;
//     return (
//       <div className="flex flex-col h-full">
//         <div className="flex items-center gap-3 px-4 pt-1 pb-3 border-b border-border flex-shrink-0">
//           <button onClick={goBack} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
//             <ChevronLeft className="w-4 h-4 text-foreground" />
//           </button>
//           <span className="text-muted-foreground text-sm font-semibold flex-1">
//             Hymn #{selectedHymn.number.toString().padStart(3, "0")}
//           </span>
//           <div className="flex rounded-full border border-border bg-muted p-0.5 gap-0.5">
//             {(["en", "yo"] as Language[]).map(lang => (
//               <button
//                 key={lang}
//                 onClick={() => setHymnLang(lang)}
//                 className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
//                   hl === lang ? "bg-primary text-white shadow-sm" : "text-muted-foreground"
//                 }`}
//               >
//                 {lang.toUpperCase()}
//               </button>
//             ))}
//           </div>
//         </div>

//         <div className="flex-1 overflow-y-auto pb-20" style={{ scrollbarWidth: "none" }}>
//           <div className="px-5 pt-5 pb-4">
//             <motion.h1
//               key={hl + selectedHymn.id}
//               initial={{ opacity: 0, y: 8 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.22 }}
//               className="text-[22px] font-bold text-foreground leading-snug"
//             >
//               {hl === "en" ? selectedHymn.titleEn : selectedHymn.titleYo}
//             </motion.h1>
//             <p className="text-muted-foreground text-sm mt-1">
//               {hl === "en" ? selectedHymn.titleYo : selectedHymn.titleEn}
//             </p>
//             {selectedHymn.author && (
//               <p className="text-muted-foreground text-xs mt-1.5 font-medium">— {selectedHymn.author}</p>
//             )}
//           </div>

//           <div className="px-5 space-y-7">
//             {selectedHymn.verses.map(verse => (
//               <motion.div
//                 key={`${verse.number}-${hl}`}
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ duration: 0.3, delay: verse.number * 0.06 }}
//               >
//                 <div className="flex items-center gap-3 mb-3">
//                   <span className="text-[10px] font-black uppercase tracking-[0.15em]" style={{ color: "#D4A017" }}>
//                     {tr("Verse", "Ẹsẹ")} {verse.number}
//                   </span>
//                   <div className="flex-1 h-px bg-border" />
//                 </div>
//                 <div className="space-y-2">
//                   {(hl === "en" ? verse.en : verse.yo).map((line, i) => (
//                     <p key={i} className="text-foreground leading-[1.8]" style={{ fontSize: `${fontSize}px` }}>{line}</p>
//                   ))}
//                 </div>
//               </motion.div>
//             ))}

//             {selectedHymn.chorus && (
//               <motion.div
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ duration: 0.3, delay: 0.4 }}
//                 className="rounded-2xl p-4"
//                 style={{ background: "rgba(26,35,126,0.05)", border: "1px solid rgba(26,35,126,0.12)" }}
//               >
//                 <div className="flex items-center gap-3 mb-3">
//                   <span className="text-[10px] font-black text-primary uppercase tracking-[0.15em]">
//                     {tr("Chorus", "Orin Àárín")}
//                   </span>
//                   <div className="flex-1 h-px" style={{ background: "rgba(26,35,126,0.15)" }} />
//                 </div>
//                 <div className="space-y-2">
//                   {(hl === "en" ? selectedHymn.chorus.en : selectedHymn.chorus.yo).map((line, i) => (
//                     <p key={i} className="text-foreground leading-[1.8] font-medium italic" style={{ fontSize: `${fontSize}px` }}>{line}</p>
//                   ))}
//                 </div>
//               </motion.div>
//             )}
//           </div>

//           {/* Metadata accordion */}
//           <div className="mx-5 mt-7 mb-4 border border-border rounded-2xl overflow-hidden">
//             <button
//               onClick={() => setMetaExpanded(!metaExpanded)}
//               className="w-full flex items-center justify-between px-4 py-3.5"
//             >
//               <span className="text-sm font-semibold text-foreground">{tr("Hymn Details", "Àlàyé Orin")}</span>
//               <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${metaExpanded ? "rotate-90" : ""}`} />
//             </button>
//             <AnimatePresence>
//               {metaExpanded && (
//                 <motion.div
//                   initial={{ height: 0, opacity: 0 }}
//                   animate={{ height: "auto", opacity: 1 }}
//                   exit={{ height: 0, opacity: 0 }}
//                   transition={{ duration: 0.2 }}
//                   className="overflow-hidden"
//                 >
//                   <div className="border-t border-border px-4 pb-4 pt-3 space-y-2.5">
//                     {[
//                       [tr("Category", "Ẹ̀ka"), selectedHymn.category],
//                       selectedHymn.author ? [tr("Author", "Òǹkọ̀wé"), selectedHymn.author] : null,
//                       [tr("Hymn Number", "Nọ́mbà Orin"), `#${selectedHymn.number}`],
//                       [tr("Verses", "Àwọn Ẹsẹ"), String(selectedHymn.verses.length)],
//                     ].filter(Boolean).map(([label, value]) => (
//                       <div key={String(label)} className="flex justify-between items-center">
//                         <span className="text-xs text-muted-foreground">{label}</span>
//                         <span className="text-xs font-semibold text-foreground capitalize">{value}</span>
//                       </div>
//                     ))}
//                     <button className="w-full mt-2 flex items-center justify-center gap-2 bg-muted py-2.5 rounded-xl text-sm font-semibold text-foreground">
//                       <Share2 className="w-4 h-4" />
//                       {tr("Share Hymn", "Pín Orin")}
//                     </button>
//                   </div>
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>
//         </div>

//         {/* FAB */}
//         <div className="absolute bottom-5 right-5 z-10">
//           <motion.button
//             onClick={() => toggleFavorite(selectedHymn.id)}
//             animate={heartPulse && isFav ? { scale: [1, 1.35, 0.85, 1.12, 1] } : {}}
//             transition={{ duration: 0.55 }}
//             className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-colors ${
//               isFav ? "bg-red-500 text-white" : "bg-card border border-border text-muted-foreground"
//             }`}
//           >
//             <Heart className={`w-6 h-6 transition-all ${isFav ? "fill-current" : ""}`} />
//           </motion.button>
//         </div>
//       </div>
//     );
//   };

//   // ── Screen: Search ───────────────────────────────────────────────────────────
//   const renderSearch = () => (
//     <div className="flex flex-col h-full">
//       <div className="px-4 pt-1 pb-3 flex-shrink-0">
//         <h2 className="text-lg font-bold text-foreground mb-3">{tr("Search Hymns", "Ìwádìí Orin")}</h2>
//         <div className="relative">
//           <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
//           <input
//             type="text"
//             value={searchQuery}
//             onChange={e => setSearchQuery(e.target.value)}
//             onKeyDown={e => {
//               if (e.key === "Enter" && searchQuery.trim()) {
//                 setRecentSearches(prev => [searchQuery.trim(), ...prev.filter(s => s !== searchQuery.trim())].slice(0, 5));
//               }
//             }}
//             placeholder={tr("Search by number, title, or lyrics...", "Ìwádìí nípasẹ̀ nọ́mbà, àkọlé, tàbí orin...")}
//             className="w-full pl-10 pr-9 py-3 bg-muted rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2"
//             style={{ "--tw-ring-color": "rgba(26,35,126,0.25)" } as React.CSSProperties}
//           />
//           {searchQuery && (
//             <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
//               <X className="w-4 h-4 text-muted-foreground" />
//             </button>
//           )}
//         </div>
//         {!searchQuery && recentSearches.length > 0 && (
//           <div className="mt-3 flex flex-wrap gap-2">
//             {recentSearches.map(s => (
//               <button
//                 key={s}
//                 onClick={() => setSearchQuery(s)}
//                 className="bg-muted text-muted-foreground text-xs px-3 py-1.5 rounded-full border border-border hover:text-foreground transition-colors"
//               >
//                 {s}
//               </button>
//             ))}
//           </div>
//         )}
//       </div>

//       <div className="flex-1 overflow-y-auto px-4 pb-4" style={{ scrollbarWidth: "none" }}>
//         {!searchQuery ? (
//           <div className="pt-10 text-center">
//             <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
//               <Search className="w-7 h-7 text-muted-foreground" />
//             </div>
//             <p className="text-muted-foreground text-sm">{tr("Search 500+ hymns", "Ìwádìí orin 500+")}</p>
//           </div>
//         ) : searchResults.length === 0 ? (
//           <div className="pt-14 text-center px-6">
//             <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
//               <FileText className="w-7 h-7 text-muted-foreground" />
//             </div>
//             <p className="font-bold text-foreground mb-1">{tr("No hymns found", "Kò sí orin")}</p>
//             <p className="text-muted-foreground text-sm">{tr("No hymns found. Try searching in English or Yoruba.", "Kò sí orin. Gbiyanju ìwádìí ní Gẹ̀ẹ́sì tàbí Yorùbá.")}</p>
//           </div>
//         ) : (
//           <div className="space-y-5 pt-2">
//             {byNumber.length > 0 && (
//               <ResultGroup title={tr("By Number", "Nípasẹ̀ Nọ́mbà")} icon={Hash} hymns={byNumber} query={searchQuery} language={language} onOpen={h => openHymn(h, "search")} />
//             )}
//             {byTitle.length > 0 && (
//               <ResultGroup title={tr("By Title", "Nípasẹ̀ Àkọlé")} icon={FileText} hymns={byTitle} query={searchQuery} language={language} onOpen={h => openHymn(h, "search")} />
//             )}
//             {byLyrics.length > 0 && (
//               <ResultGroup title={tr("By Lyrics", "Nípasẹ̀ Orin")} icon={Music} hymns={byLyrics} query={searchQuery} language={language} onOpen={h => openHymn(h, "search")} />
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );

//   // ── Screen: Categories ───────────────────────────────────────────────────────
//   const renderCategories = () => (
//     <div className="flex flex-col h-full">
//       <div className="px-4 pt-1 pb-3 flex-shrink-0">
//         <h2 className="text-lg font-bold text-foreground">{tr("Categories", "Àwọn Ẹ̀ka")}</h2>
//         <p className="text-muted-foreground text-sm">{tr("Browse hymns by theme", "Wo àwọn orin nípasẹ̀ àkòrí")}</p>
//       </div>
//       <div className="flex-1 overflow-y-auto px-4 pb-4" style={{ scrollbarWidth: "none" }}>
//         <div className="grid grid-cols-2 gap-3">
//           {CATEGORIES.map(cat => {
//             const { Icon } = cat;
//             return (
//               <button
//                 key={cat.id}
//                 onClick={() => { setSelectedCategory(cat); setScreen("category-detail"); }}
//                 className="bg-card border border-border rounded-2xl p-4 text-left active:scale-95 transition-all hover:border-primary/20"
//               >
//                 <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ background: cat.bg }}>
//                   <Icon className="w-5 h-5" style={{ color: cat.color }} />
//                 </div>
//                 <p className="font-bold text-foreground text-[13px]">{language === "en" ? cat.nameEn : cat.nameYo}</p>
//                 <p className="text-muted-foreground text-xs mt-0.5">{cat.hymnCount} {tr("hymns", "orin")}</p>
//               </button>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );

//   // ── Screen: Category Detail ──────────────────────────────────────────────────
//   const renderCategoryDetail = () => {
//     if (!selectedCategory) return null;
//     const { Icon } = selectedCategory;
//     const catHymns = HYMNS.filter(h => h.category === selectedCategory.id);
//     const displayHymns = catHymns.length > 0 ? catHymns : HYMNS.slice(0, 5);
//     return (
//       <div className="flex flex-col h-full">
//         <div className="flex items-center gap-3 px-4 pt-1 pb-3 border-b border-border flex-shrink-0">
//           <button
//             onClick={() => { setSelectedCategory(null); setScreen("categories"); }}
//             className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
//           >
//             <ChevronLeft className="w-4 h-4 text-foreground" />
//           </button>
//           <div className="flex items-center gap-2">
//             <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: selectedCategory.bg }}>
//               <Icon className="w-4 h-4" style={{ color: selectedCategory.color }} />
//             </div>
//             <h2 className="text-base font-bold text-foreground">
//               {language === "en" ? selectedCategory.nameEn : selectedCategory.nameYo}
//             </h2>
//           </div>
//           <span className="ml-auto text-xs text-muted-foreground">{selectedCategory.hymnCount} {tr("hymns", "orin")}</span>
//         </div>
//         <div className="flex-1 overflow-y-auto pb-4" style={{ scrollbarWidth: "none" }}>
//           <div className="divide-y divide-border">
//             {displayHymns.map(hymn => (
//               <button
//                 key={hymn.id}
//                 onClick={() => openHymn(hymn, "category-detail")}
//                 className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-muted/40 transition-colors text-left"
//               >
//                 <span className="font-black text-sm w-9 flex-shrink-0" style={{ color: "#D4A017" }}>
//                   {hymn.number.toString().padStart(3, "0")}
//                 </span>
//                 <div className="flex-1 min-w-0">
//                   <p className="text-foreground text-sm font-semibold truncate">{hymnTitle(hymn)}</p>
//                   <p className="text-muted-foreground text-[11px] truncate">
//                     {language === "en" ? hymn.titleYo : hymn.titleEn}
//                   </p>
//                 </div>
//                 <div className="flex items-center gap-1.5">
//                   {favorites.includes(hymn.id) && <Heart className="w-3.5 h-3.5 text-red-400 fill-current" />}
//                   <ChevronRight className="w-4 h-4 text-muted-foreground" />
//                 </div>
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // ── Screen: Favorites ────────────────────────────────────────────────────────
//   const renderFavorites = () => (
//     <div className="flex flex-col h-full">
//       <div className="px-4 pt-1 pb-3 flex-shrink-0">
//         <h2 className="text-lg font-bold text-foreground">{tr("Favorites", "Àyọ̀ Mi")}</h2>
//         <p className="text-muted-foreground text-sm">
//           {favoriteHymns.length} {tr("saved hymns", "orin tí a pamọ́")}
//         </p>
//       </div>
//       <div className="flex-1 overflow-y-auto pb-4" style={{ scrollbarWidth: "none" }}>
//         {favoriteHymns.length === 0 ? (
//           <div className="pt-20 text-center px-8">
//             <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#FFF0F0" }}>
//               <Heart className="w-9 h-9 text-red-200" />
//             </div>
//             <p className="font-bold text-foreground text-base mb-1">{tr("No favorites yet", "Ko sí orin ayọ̀")}</p>
//             <p className="text-muted-foreground text-sm leading-relaxed">
//               {tr("Tap the heart icon while reading a hymn.", "Tẹ àmi ọkàn nígbà tí o bá ń ka orin.")}
//             </p>
//             <button
//               onClick={() => navigateTab("search")}
//               className="mt-5 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-semibold"
//             >
//               {tr("Find Hymns", "Ìwádìí Orin")}
//             </button>
//           </div>
//         ) : (
//           <div className="px-4 space-y-2">
//             {favoriteHymns.map(hymn => (
//               <div key={hymn.id} className="relative overflow-hidden rounded-2xl">
//                 <div className="absolute inset-0 bg-red-500 flex items-center justify-end pr-4 rounded-2xl">
//                   <Trash2 className="w-5 h-5 text-white" />
//                 </div>
//                 <motion.div
//                   animate={{ x: swipedFavId === hymn.id ? -76 : 0 }}
//                   transition={{ type: "spring", stiffness: 350, damping: 32 }}
//                   className="relative bg-card border border-border rounded-2xl"
//                 >
//                   <div className="flex items-center gap-3 px-4 py-3.5">
//                     <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
//                     <span className="font-black text-sm w-8 flex-shrink-0" style={{ color: "#D4A017" }}>
//                       {hymn.number.toString().padStart(3, "0")}
//                     </span>
//                     <button
//                       className="flex-1 min-w-0 text-left"
//                       onClick={() => swipedFavId === hymn.id ? setSwipedFavId(null) : openHymn(hymn, "favorites")}
//                     >
//                       <p className="text-foreground text-sm font-semibold truncate">{hymnTitle(hymn)}</p>
//                       <p className="text-muted-foreground text-[11px] capitalize">{hymn.category}</p>
//                     </button>
//                     <button onClick={() => setSwipedFavId(swipedFavId === hymn.id ? null : hymn.id)} className="flex-shrink-0 p-1">
//                       <Heart className="w-5 h-5 text-red-400 fill-current" />
//                     </button>
//                   </div>
//                 </motion.div>
//                 {swipedFavId === hymn.id && (
//                   <button
//                     onClick={() => { toggleFavorite(hymn.id); setSwipedFavId(null); }}
//                     className="absolute right-0 top-0 bottom-0 w-20"
//                   />
//                 )}
//               </div>
//             ))}
//             <p className="text-center text-xs text-muted-foreground pt-2">{tr("Swipe left on a hymn to remove", "Fà ọwọ́ sí òsì láti yọ")}</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );

//   // ── Screen: Settings ─────────────────────────────────────────────────────────
//   const renderSettings = () => (
//     <div className="flex flex-col h-full">
//       <div className="px-4 pt-1 pb-3 flex-shrink-0">
//         <h2 className="text-lg font-bold text-foreground">{tr("Settings", "Ìtòlẹ́sẹẹ̀")}</h2>
//       </div>
//       <div className="flex-1 overflow-y-auto pb-6 space-y-3 px-4" style={{ scrollbarWidth: "none" }}>

//         <SettingsSection title={tr("Language", "Èdè")} icon={Globe}>
//           <div className="space-y-1">
//             {([["en", "🇬🇧  English"], ["yo", "🇳🇬  Yorùbá"], ["auto", `🌐  ${tr("Auto-detect", "Àwárí Adáṣe")}`]] as [string, string][]).map(([val, label]) => (
//               <button
//                 key={val}
//                 onClick={() => { setSettingsLang(val as "en" | "yo" | "auto"); if (val !== "auto") setLanguage(val as Language); }}
//                 className="w-full flex items-center justify-between py-2.5"
//               >
//                 <span className="text-sm text-foreground">{label}</span>
//                 <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${settingsLang === val ? "border-primary bg-primary" : "border-muted-foreground/40"}`}>
//                   {settingsLang === val && <div className="w-2 h-2 rounded-full bg-white" />}
//                 </div>
//               </button>
//             ))}
//           </div>
//         </SettingsSection>

//         <SettingsSection title={tr("Devotional Reminder", "Ìránilétí Ìjọ̀sìn")} icon={Bell}>
//           <div className="space-y-3">
//             <div className="flex items-center justify-between">
//               <span className="text-sm text-foreground">{tr("Daily reminder", "Ìránilétí ojoojúmọ́")}</span>
//               <Toggle on={reminderEnabled} onToggle={() => setReminderEnabled(!reminderEnabled)} />
//             </div>
//             {reminderEnabled && (
//               <div className="flex items-center justify-between">
//                 <span className="text-sm text-muted-foreground">{tr("Time", "Àkókò")}</span>
//                 <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-xl">
//                   <Clock className="w-3.5 h-3.5 text-muted-foreground" />
//                   <input
//                     type="time"
//                     value={reminderTime}
//                     onChange={e => setReminderTime(e.target.value)}
//                     className="text-sm font-semibold bg-transparent text-foreground outline-none"
//                   />
//                 </div>
//               </div>
//             )}
//           </div>
//         </SettingsSection>

//         <SettingsSection title={tr("Lyrics Font Size", "Iwọn Àkọ́ Orin")} icon={FileText}>
//           <div className="space-y-3">
//             <div className="flex items-center justify-between">
//               <span className="text-xs text-muted-foreground">A</span>
//               <span className="text-sm font-bold text-foreground">{fontSize}px</span>
//               <span className="text-lg font-bold text-muted-foreground">A</span>
//             </div>
//             <input
//               type="range" min={12} max={24} value={fontSize}
//               onChange={e => setFontSize(Number(e.target.value))}
//               className="w-full accent-primary cursor-pointer"
//             />
//             <div className="bg-muted rounded-xl p-3">
//               <p className="text-foreground leading-relaxed" style={{ fontSize: `${fontSize}px` }}>
//                 {tr("Amazing grace, how sweet the sound…", "Ìfẹ́ àánú iyanu, bí o ṣe dára tó…")}
//               </p>
//             </div>
//           </div>
//         </SettingsSection>

//         <SettingsSection title={tr("Appearance", "Àwòrán")} icon={darkMode ? Moon : Sun}>
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2.5">
//               {darkMode
//                 ? <Moon className="w-4 h-4 text-muted-foreground" />
//                 : <Sun className="w-4 h-4 text-muted-foreground" />}
//               <span className="text-sm text-foreground">{tr("Dark Mode", "Ipo Dudu")}</span>
//             </div>
//             <Toggle on={darkMode} onToggle={() => setDarkMode(!darkMode)} />
//           </div>
//         </SettingsSection>

//         <SettingsSection title={tr("About", "Nípa")} icon={Info}>
//           <div className="space-y-2.5">
//             {[
//               [tr("App Version", "Ẹya Ohun Èlò"), "1.0.0"],
//               [tr("Hymnal Edition", "Ẹya Orin Ìyìn"), "CAC 2024"],
//               [tr("Total Hymns", "Àpapọ̀ Orin"), "500+"],
//               [tr("Languages", "Àwọn Èdè"), "English · Yorùbá"],
//             ].map(([label, value]) => (
//               <div key={String(label)} className="flex justify-between items-center">
//                 <span className="text-xs text-muted-foreground">{label}</span>
//                 <span className="text-xs font-semibold text-foreground">{value}</span>
//               </div>
//             ))}
//             <p className="text-xs text-muted-foreground leading-relaxed pt-1 border-t border-border mt-1">
//               {tr(
//                 "A digital hymnal for CAC congregations worldwide, enabling worship in English and Yoruba.",
//                 "Iwe orin ìjọsìn alailẹgbẹ fún àwọn ìjọ CAC káàkiri àgbáálá ayé."
//               )}
//             </p>
//           </div>
//         </SettingsSection>

//         <button
//           onClick={() => { setFavorites([]); setRecentlyViewed([]); setRecentSearches([]); }}
//           className="w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 text-red-600 dark:text-red-400"
//           style={{ background: "rgba(198,40,40,0.08)" }}
//         >
//           <Trash2 className="w-4 h-4" />
//           {tr("Clear All Data", "Pa Gbogbo Dátà")}
//         </button>

//         <p className="text-center text-[11px] text-muted-foreground pb-2">
//           Made with ♥ for CAC congregations worldwide
//         </p>
//       </div>
//     </div>
//   );

//   // ── Modal: Devotional Reminder ───────────────────────────────────────────────
//   const DevotionalModal = () => (
//     <AnimatePresence>
//       {showDevotional && (
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//           className="absolute inset-0 z-50 flex items-end"
//           style={{ background: "rgba(0,0,0,0.5)" }}
//           onClick={() => setShowDevotional(false)}
//         >
//           <motion.div
//             initial={{ y: "100%" }}
//             animate={{ y: 0 }}
//             exit={{ y: "100%" }}
//             transition={{ type: "spring", stiffness: 320, damping: 30 }}
//             onClick={e => e.stopPropagation()}
//             className="w-full bg-card rounded-t-3xl p-6 pb-10 shadow-2xl"
//           >
//             <div className="w-10 h-1 rounded-full bg-border mx-auto mb-5" />

//             <div className="flex items-center gap-3 mb-5">
//               <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
//                 style={{ background: "rgba(212,160,23,0.15)" }}>
//                 🌅
//               </div>
//               <div>
//                 <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-0.5">
//                   {tr("Devotional Reminder", "Ìránilétí Ìjọ̀sìn")}
//                 </p>
//                 <h3 className="text-lg font-bold text-foreground">{tr("Good Morning!", "Ẹ káàárọ̀!")}</h3>
//               </div>
//             </div>

//             <div className="rounded-2xl p-4 mb-5" style={{ background: "rgba(26,35,126,0.05)", border: "1px solid rgba(26,35,126,0.12)" }}>
//               <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1.5">
//                 {tr("Today's Hymn", "Orin Ọjọ Oni")}
//               </p>
//               <h4 className="text-base font-bold text-foreground">{hymnTitle(hymnOfTheDay)}</h4>
//               <p className="text-muted-foreground text-xs mt-1.5 italic leading-relaxed">
//                 {hymnOfTheDay.verses[0][language === "en" ? "en" : "yo"][0]}
//               </p>
//             </div>

//             <p className="text-sm text-muted-foreground text-center mb-5">
//               {tr("Start your day with praise ✨", "Bẹ̀rẹ̀ ọjọ́ rẹ pẹ̀lú ìyin ✨")}
//             </p>

//             <button
//               onClick={() => { setShowDevotional(false); openHymn(hymnOfTheDay, screen); }}
//               className="w-full bg-primary text-primary-foreground py-3.5 rounded-2xl font-bold text-sm mb-2.5"
//             >
//               {tr("Open Hymn", "Ṣí Orin")}
//             </button>
//             <button
//               onClick={() => setShowDevotional(false)}
//               className="w-full py-2.5 text-muted-foreground text-sm font-medium"
//             >
//               {tr("Dismiss", "Pa")}
//             </button>
//           </motion.div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );

//   // ── Render ───────────────────────────────────────────────────────────────────
//   const renderScreen = () => {
//     switch (screen) {
//       case "onboarding":      return renderOnboarding();
//       case "home":            return renderHome();
//       case "hymn-detail":     return renderHymnDetail();
//       case "search":          return renderSearch();
//       case "categories":      return renderCategories();
//       case "category-detail": return renderCategoryDetail();
//       case "favorites":       return renderFavorites();
//       case "settings":        return renderSettings();
//       default:                return renderHome();
//     }
//   };

//   return (
//     <div
//       className="min-h-screen flex items-center justify-center"
//       style={{ background: "linear-gradient(135deg, #1a237e 0%, #283593 40%, #1565c0 100%)" }}
//     >
//       <div
//         className="relative w-full max-w-[393px] h-screen max-h-[852px] bg-background overflow-hidden flex flex-col md:rounded-[44px] md:shadow-2xl"
//         style={{ fontFamily: "'Inter', sans-serif" }}
//       >
//         {screen !== "onboarding" && <StatusBar />}

//         <div className="flex-1 overflow-hidden flex flex-col min-h-0">
//           <AnimatePresence mode="wait">
//             <motion.div
//               key={screen}
//               initial={{ opacity: 0, x: screen === "hymn-detail" ? 24 : screen === "onboarding" ? 0 : -8 }}
//               animate={{ opacity: 1, x: 0 }}
//               exit={{ opacity: 0, x: screen === "hymn-detail" ? -24 : 8 }}
//               transition={{ duration: 0.18, ease: "easeOut" }}
//               className="flex-1 flex flex-col overflow-hidden min-h-0"
//             >
//               {renderScreen()}
//             </motion.div>
//           </AnimatePresence>
//         </div>

//         {showBottomNav && <BottomNav />}

//         {screen !== "onboarding" && <DevotionalModal />}
//       </div>
//     </div>
//   );
// }






import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";

import { motion, AnimatePresence } from "motion/react";

import {
  Home,
  Search,
  Grid3X3,
  Heart,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  Share2,
  BookOpen,
  X,
  Moon,
  Sun,
  Star,
  Music,
  GripVertical,
  Hash,
  FileText,
  Info,
  Trash2,
  Globe,
  Clock,
  DownloadCloud,
  Wifi,
  WifiOff,
  RefreshCw,
  Loader2,
} from "lucide-react";

// ── API + Storage Config ──────────────────────────────────────────────────────

const API_BASE = "https://worker.hymnize.com/api";
const DENOMINATION = "cac";

const DB_NAME = "cac-gospel-hymnal-db";
const DB_VERSION = 1;
const STORE_NAME = "kv";

const CACHE_PREFIX = `hymnize:${DENOMINATION}`;
const CATALOG_CACHE_KEY = `${CACHE_PREFIX}:catalog:v1`;
const OFFLINE_READY_KEY = `${CACHE_PREFIX}:offline-ready:v1`;
const CATALOG_TTL_MS = 24 * 60 * 60 * 1000;

const LS_PREFIX = "cac-hymnal:";
const LS_ONBOARDED = `${LS_PREFIX}onboarded`;
const LS_LANGUAGE = `${LS_PREFIX}language`;
const LS_SETTINGS_LANG = `${LS_PREFIX}settings-language`;
const LS_FAVORITES = `${LS_PREFIX}favorites`;
const LS_RECENTLY_VIEWED = `${LS_PREFIX}recently-viewed`;
const LS_RECENT_SEARCHES = `${LS_PREFIX}recent-searches`;
const LS_DARK_MODE = `${LS_PREFIX}dark-mode`;
const LS_FONT_SIZE = `${LS_PREFIX}font-size`;
const LS_REMINDER_ENABLED = `${LS_PREFIX}reminder-enabled`;
const LS_REMINDER_TIME = `${LS_PREFIX}reminder-time`;

// ── Types ─────────────────────────────────────────────────────────────────────

// type Screen =
//   | "onboarding"
//   | "home"
//   | "search"
//   | "categories"
//   | "category-detail"
//   | "favorites"
//   | "settings"
//   | "hymn-detail";

type Screen =
  | "onboarding"
  | "home"
  | "all-hymns"
  | "search"
  | "categories"
  | "category-detail"
  | "favorites"
  | "settings"
  | "hymn-detail";

type Language = "en" | "yo";
type ApiLanguage = "english" | "yoruba";
type HymnType = "regular" | "various";

type Tab = "home" | "search" | "categories" | "favorites" | "settings";

interface Verse {
  number: number;
  en: string[];
  yo: string[];
}

interface HymnSummary {
  id: number;
  number: number;
  hymnType: HymnType;

  titleEn: string;
  titleYo: string;

  category: string;
  categoryEn: string;
  categoryYo: string;

  meter?: string | null;
  scripture?: string | null;
  author?: string;
}

interface Hymn extends HymnSummary {
  verses: Verse[];
  chorus?: {
    en: string[];
    yo: string[];
  };
}

interface CategoryDef {
  id: string;
  nameEn: string;
  nameYo: string;
  Icon: ElementType;
  hymnCount: number;
  color: string;
  bg: string;
}

interface ApiIndexItem {
  category: string;
  hymn_type: HymnType;
  meter: string | null;
  original_id: number;
  title: string;
}

interface ApiIndexResponse {
  denomination: string;
  language: ApiLanguage;
  indexes: ApiIndexItem[];
}

interface ApiLine {
  dynamic: string | null;
  text: string;
}

interface ApiStanza {
  no: number;
  lines: ApiLine[];
}

interface ApiChorus {
  lines: ApiLine[];
}

interface ApiHymnData {
  category: string;
  chorus: ApiChorus | null;
  denomination: string;
  hymn_type: HymnType;
  id: number;
  language: ApiLanguage;
  meter: string | null;
  original_id: number;
  scripture: string | null;
  stanzas: ApiStanza[];
}

interface ApiHymnResponse {
  hymn?: ApiHymnData;
}

interface CachedValue<T> {
  savedAt: number;
  data: T;
}

// ── LocalStorage Helpers ──────────────────────────────────────────────────────

function loadLocal<T>(key: string, fallback: T): T {
  try {
    if (typeof window === "undefined") return fallback;

    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;

    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveLocal<T>(key: string, value: T) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage errors.
  }
}

function loadLanguage(): Language {
  return loadLocal<string>(LS_LANGUAGE, "en") === "yo" ? "yo" : "en";
}

function detectBrowserLanguage(): Language {
  if (typeof navigator === "undefined") return "en";
  return navigator.language.toLowerCase().startsWith("yo") ? "yo" : "en";
}

// ── IndexedDB Helpers ─────────────────────────────────────────────────────────

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available in this browser."));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

function idbGet<T>(key: string): Promise<T | undefined> {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(key);

        request.onsuccess = () => resolve(request.result as T | undefined);
        request.onerror = () => reject(request.error);
      })
  );
}

function idbSet<T>(key: string, value: T): Promise<void> {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);

        store.put(value, key);

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      })
  );
}

function idbClear(): Promise<void> {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);

        store.clear();

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      })
  );
}

async function cacheGet<T>(key: string): Promise<T | undefined> {
  try {
    return await idbGet<T>(key);
  } catch {
    return undefined;
  }
}

async function cacheSet<T>(key: string, value: T): Promise<void> {
  try {
    await idbSet(key, value);
  } catch {
    // Ignore cache write errors.
  }
}

async function cacheClear(): Promise<void> {
  try {
    await idbClear();
  } catch {
    // Ignore cache clear errors.
  }
}

// ── Hymnize API Helpers ───────────────────────────────────────────────────────

function makeHymnId(type: HymnType, number: number) {
  /**
   * API has:
   * - regular hymn 1
   * - various hymn 1
   *
   * So number alone is not unique.
   */
  return type === "regular" ? number : 100000 + number;
}

function makeHymnKey(type: HymnType, number: number) {
  return `${type}:${number}`;
}

function hymnCacheKey(type: HymnType, number: number) {
  return `${CACHE_PREFIX}:hymn:v1:${type}:${number}`;
}

function displayHymnNumber(hymn: Pick<HymnSummary, "hymnType" | "number">) {
  const number = hymn.number.toString().padStart(3, "0");
  return hymn.hymnType === "various" ? `V${number}` : number;
}

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "uncategorized"
  );
}

async function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    signal,
  });

  if (!res.ok) {
    throw new Error(`Hymnize API error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

async function fetchIndexes(language: ApiLanguage, signal?: AbortSignal) {
  const data = await apiGet<ApiIndexResponse>(
    `/hymns/${DENOMINATION}/${language}/indexes`,
    signal
  );

  return data.indexes ?? [];
}

async function fetchCatalog(signal?: AbortSignal): Promise<HymnSummary[]> {
  const [englishIndexes, yorubaIndexes] = await Promise.all([
    fetchIndexes("english", signal),
    fetchIndexes("yoruba", signal),
  ]);

  const englishMap = new Map(
    englishIndexes.map((item) => [
      makeHymnKey(item.hymn_type, item.original_id),
      item,
    ])
  );

  const yorubaMap = new Map(
    yorubaIndexes.map((item) => [
      makeHymnKey(item.hymn_type, item.original_id),
      item,
    ])
  );

  const keys = Array.from(new Set([...englishMap.keys(), ...yorubaMap.keys()]));

  return keys
    .map((key) => {
      const english = englishMap.get(key);
      const yoruba = yorubaMap.get(key);
      const source = english ?? yoruba;

      if (!source) {
        throw new Error(`Invalid hymn index key: ${key}`);
      }

      const hymnType = source.hymn_type;
      const number = source.original_id;

      const categoryEn =
        english?.category ?? yoruba?.category ?? "Uncategorized";

      const categoryYo =
        yoruba?.category ?? english?.category ?? "Uncategorized";

      return {
        id: makeHymnId(hymnType, number),
        number,
        hymnType,

        titleEn: english?.title ?? yoruba?.title ?? `Hymn ${number}`,
        titleYo: yoruba?.title ?? english?.title ?? `Hymn ${number}`,

        category: slugify(categoryEn),
        categoryEn,
        categoryYo,

        meter: english?.meter ?? yoruba?.meter ?? null,
      };
    })
    .sort((a, b) => {
      const typeOrder: Record<HymnType, number> = {
        regular: 0,
        various: 1,
      };

      if (a.hymnType !== b.hymnType) {
        return typeOrder[a.hymnType] - typeOrder[b.hymnType];
      }

      return a.number - b.number;
    });
}

async function saveCatalog(data: HymnSummary[]) {
  await cacheSet<CachedValue<HymnSummary[]>>(CATALOG_CACHE_KEY, {
    savedAt: Date.now(),
    data,
  });
}

async function getCatalogFresh(): Promise<HymnSummary[]> {
  const fresh = await fetchCatalog();
  await saveCatalog(fresh);
  return fresh;
}

async function getCatalogCached(): Promise<HymnSummary[]> {
  const cached = await cacheGet<CachedValue<HymnSummary[]>>(CATALOG_CACHE_KEY);

  const cacheIsFresh = cached && Date.now() - cached.savedAt < CATALOG_TTL_MS;

  if (cacheIsFresh) {
    return cached.data;
  }

  try {
    return await getCatalogFresh();
  } catch (error) {
    if (cached) return cached.data;
    throw error;
  }
}

async function refreshCatalogInBackground(
  onFreshData?: (data: HymnSummary[]) => void
) {
  try {
    const fresh = await getCatalogFresh();
    onFreshData?.(fresh);
  } catch {
    // Ignore background refresh errors.
  }
}

async function fetchApiHymn(
  language: ApiLanguage,
  type: HymnType,
  hymnNumber: number,
  signal?: AbortSignal
) {
  const data = await apiGet<ApiHymnResponse>(
    `/hymns/${DENOMINATION}/${language}/${type}/hymn/${hymnNumber}`,
    signal
  );

  if (!data.hymn) {
    throw new Error(`Hymn not found: ${language} ${type} ${hymnNumber}`);
  }

  return data.hymn;
}

function extractLines(lines?: ApiLine[]) {
  return lines?.map((line) => line.text).filter(Boolean) ?? [];
}

function mergeApiHymns(
  summary: HymnSummary,
  english?: ApiHymnData,
  yoruba?: ApiHymnData
): Hymn {
  const englishStanzas = new Map(
    english?.stanzas.map((stanza) => [stanza.no, stanza]) ?? []
  );

  const yorubaStanzas = new Map(
    yoruba?.stanzas.map((stanza) => [stanza.no, stanza]) ?? []
  );

  const stanzaNumbers = Array.from(
    new Set([...englishStanzas.keys(), ...yorubaStanzas.keys()])
  ).sort((a, b) => a - b);

  const verses: Verse[] = stanzaNumbers.map((number) => ({
    number,
    en: extractLines(englishStanzas.get(number)?.lines),
    yo: extractLines(yorubaStanzas.get(number)?.lines),
  }));

  const chorusEn = extractLines(english?.chorus?.lines);
  const chorusYo = extractLines(yoruba?.chorus?.lines);

  return {
    ...summary,
    categoryEn: english?.category ?? summary.categoryEn,
    categoryYo: yoruba?.category ?? summary.categoryYo,
    meter: english?.meter ?? yoruba?.meter ?? summary.meter,
    scripture: english?.scripture ?? yoruba?.scripture ?? summary.scripture,
    verses,
    chorus:
      chorusEn.length > 0 || chorusYo.length > 0
        ? {
          en: chorusEn,
          yo: chorusYo,
        }
        : undefined,
  };
}

async function getHymnCached(
  summary: HymnSummary,
  options?: { forceRefresh?: boolean }
): Promise<Hymn> {
  const key = hymnCacheKey(summary.hymnType, summary.number);
  const cached = await cacheGet<CachedValue<Hymn>>(key);

  if (cached && !options?.forceRefresh) {
    return cached.data;
  }

  try {
    const [englishResult, yorubaResult] = await Promise.allSettled([
      fetchApiHymn("english", summary.hymnType, summary.number),
      fetchApiHymn("yoruba", summary.hymnType, summary.number),
    ]);

    const english =
      englishResult.status === "fulfilled" ? englishResult.value : undefined;

    const yoruba =
      yorubaResult.status === "fulfilled" ? yorubaResult.value : undefined;

    if (!english && !yoruba) {
      throw new Error("Could not load hymn in English or Yoruba.");
    }

    const merged = mergeApiHymns(summary, english, yoruba);

    await cacheSet<CachedValue<Hymn>>(key, {
      savedAt: Date.now(),
      data: merged,
    });

    return merged;
  } catch (error) {
    if (cached) return cached.data;
    throw error;
  }
}

async function downloadAllHymns(
  catalog: HymnSummary[],
  onProgress?: (done: number, total: number, hymn: HymnSummary) => void
): Promise<{ failed: number }> {
  const total = catalog.length;
  let done = 0;
  let failed = 0;
  let cursor = 0;

  const concurrency = 3;

  async function worker() {
    while (true) {
      const currentIndex = cursor;
      cursor += 1;

      if (currentIndex >= total) return;

      const hymn = catalog[currentIndex];

      try {
        await getHymnCached(hymn, { forceRefresh: true });
      } catch (error) {
        failed += 1;
        console.warn("Failed to cache hymn", hymn, error);
      }

      done += 1;
      onProgress?.(done, total, hymn);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  return { failed };
}

async function searchCachedLyrics(
  catalog: HymnSummary[],
  query: string,
  limit = 40
): Promise<HymnSummary[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: HymnSummary[] = [];

  for (const summary of catalog) {
    const cached = await cacheGet<CachedValue<Hymn>>(
      hymnCacheKey(summary.hymnType, summary.number)
    );

    const hymn = cached?.data;
    if (!hymn) continue;

    const lyricsText = [
      ...hymn.verses.flatMap((verse) => [...verse.en, ...verse.yo]),
      ...(hymn.chorus?.en ?? []),
      ...(hymn.chorus?.yo ?? []),
    ]
      .join("\n")
      .toLowerCase();

    if (lyricsText.includes(q)) {
      results.push(summary);

      if (results.length >= limit) break;
    }
  }

  return results;
}

// ── Category Builder ──────────────────────────────────────────────────────────

const CATEGORY_STYLES = [
  { Icon: Star, color: "#B8860B", bg: "#FDF3DC" },
  { Icon: Music, color: "#1A237E", bg: "#E8EAFB" },
  { Icon: Heart, color: "#2E7D32", bg: "#E8F5E9" },
  { Icon: BookOpen, color: "#6A1B9A", bg: "#F3E5F5" },
  { Icon: ChevronRight, color: "#C62828", bg: "#FFEBEE" },
  { Icon: Sun, color: "#E65100", bg: "#FBE9E7" },
  { Icon: Moon, color: "#37474F", bg: "#ECEFF1" },
];

function buildCategoriesFromHymns(hymns: HymnSummary[]): CategoryDef[] {
  const grouped = new Map<string, HymnSummary[]>();

  hymns.forEach((hymn) => {
    const current = grouped.get(hymn.category) ?? [];
    current.push(hymn);
    grouped.set(hymn.category, current);
  });

  return Array.from(grouped.entries())
    .map(([id, items], index) => {
      const first = items[0];
      const style = CATEGORY_STYLES[index % CATEGORY_STYLES.length];

      return {
        id,
        nameEn: first.categoryEn,
        nameYo: first.categoryYo,
        hymnCount: items.length,
        Icon: style.Icon,
        color: style.color,
        bg: style.bg,
      };
    })
    .sort((a, b) => a.nameEn.localeCompare(b.nameEn));
}

// ── Shared UI Components ──────────────────────────────────────────────────────

function HymnBookLogo({
  size = 40,
  light = false,
}: {
  size?: number;
  light?: boolean;
}) {
  const stroke = light ? "white" : "#1A237E";

  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path
        d="M24 10 C18 10 7 12 5 15 L5 41 C7 38 18 37 24 37"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 10 C30 10 41 12 43 15 L43 41 C41 38 30 37 24 37"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="24"
        y1="10"
        x2="24"
        y2="37"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="34.5"
        y1="17"
        x2="34.5"
        y2="33"
        stroke="#D4A017"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="28"
        y1="23"
        x2="41"
        y2="23"
        stroke="#D4A017"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Toggle({
  on,
  onToggle,
}: {
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${on ? "bg-primary" : "bg-muted"
        }`}
    >
      <div
        className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${on ? "left-7" : "left-1"
          }`}
      />
    </button>
  );
}

function SettingsSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: ElementType;
  children: ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/40">
        <Icon className="w-3.5 h-3.5 text-primary" />
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
      </div>

      <div className="px-4 py-3">{children}</div>
    </div>
  );
}

function ResultGroup({
  title,
  icon: Icon,
  hymns,
  query,
  language,
  onOpen,
}: {
  title: string;
  icon: ElementType;
  hymns: HymnSummary[];
  query: string;
  language: Language;
  onOpen: (h: HymnSummary) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-3 h-3 text-muted-foreground" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          {title}
        </span>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
        {hymns.slice(0, 8).map((hymn) => {
          const matchLine =
            "verses" in hymn
              ? (hymn as Hymn).verses
                .flatMap((v) => [...v.en, ...v.yo])
                .find((l) =>
                  l.toLowerCase().includes(query.toLowerCase())
                )
              : null;

          return (
            <button
              key={hymn.id}
              onClick={() => onOpen(hymn)}
              className="w-full p-3 hover:bg-muted/50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-[#D4A017] font-black text-sm w-10 flex-shrink-0">
                  {displayHymnNumber(hymn)}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-foreground text-sm font-semibold">
                      {language === "en" ? hymn.titleEn : hymn.titleYo}
                    </span>

                    <span className="text-muted-foreground text-xs">
                      · {language === "en" ? hymn.titleYo : hymn.titleEn}
                    </span>
                  </div>

                  <p className="text-muted-foreground text-xs mt-0.5 truncate">
                    {matchLine ??
                      `${hymn.hymnType === "various" ? "Various · " : ""}${language === "en" ? hymn.categoryEn : hymn.categoryYo
                      }`}
                  </p>
                </div>

                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────

export default function App() {
  const openRequestId = useRef(0);
  const devotionalShown = useRef(false);

  const [screen, setScreen] = useState<Screen>(() =>
    loadLocal<boolean>(LS_ONBOARDED, false) ? "home" : "onboarding"
  );

  const [prevScreen, setPrevScreen] = useState<Screen>("home");
  const [activeTab, setActiveTab] = useState<Tab>("home");

  const [language, setLanguage] = useState<Language>(() => loadLanguage());
  const [hymnLang, setHymnLang] = useState<Language>(() => loadLanguage());

  const [hymns, setHymns] = useState<HymnSummary[]>([]);
  const [hymnsLoading, setHymnsLoading] = useState(true);
  const [hymnsError, setHymnsError] = useState<string | null>(null);

  const [selectedHymn, setSelectedHymn] = useState<Hymn | null>(null);
  const [pendingHymn, setPendingHymn] = useState<HymnSummary | null>(null);
  const [hymnDetailLoading, setHymnDetailLoading] = useState(false);
  const [hymnDetailError, setHymnDetailError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] =
    useState<CategoryDef | null>(null);

  const [favorites, setFavorites] = useState<number[]>(() =>
    loadLocal<number[]>(LS_FAVORITES, [])
  );

  const [recentlyViewed, setRecentlyViewed] = useState<number[]>(() =>
    loadLocal<number[]>(LS_RECENTLY_VIEWED, [])
  );

  const [searchQuery, setSearchQuery] = useState("");

  const [recentSearches, setRecentSearches] = useState<string[]>(() =>
    loadLocal<string[]>(LS_RECENT_SEARCHES, [
      "Amazing Grace",
      "Holy Holy Holy",
      "Morning",
    ])
  );

  const [lyricsResults, setLyricsResults] = useState<HymnSummary[]>([]);
  const [lyricsSearchLoading, setLyricsSearchLoading] = useState(false);

  const [darkMode, setDarkMode] = useState<boolean>(() =>
    loadLocal<boolean>(LS_DARK_MODE, false)
  );

  const [fontSize, setFontSize] = useState<number>(() =>
    loadLocal<number>(LS_FONT_SIZE, 16)
  );

  const [showDevotional, setShowDevotional] = useState(false);
  const [heartPulse, setHeartPulse] = useState(false);

  const [reminderEnabled, setReminderEnabled] = useState<boolean>(() =>
    loadLocal<boolean>(LS_REMINDER_ENABLED, true)
  );

  const [reminderTime, setReminderTime] = useState<string>(() =>
    loadLocal<string>(LS_REMINDER_TIME, "06:00")
  );

  const [settingsLang, setSettingsLang] = useState<"en" | "yo" | "auto">(() =>
    loadLocal<"en" | "yo" | "auto">(LS_SETTINGS_LANG, loadLanguage())
  );

  const [metaExpanded, setMetaExpanded] = useState(false);
  const [swipedFavId, setSwipedFavId] = useState<number | null>(null);
  const [onboardLang, setOnboardLang] = useState<Language>(() =>
    loadLanguage()
  );

  const [offlineReady, setOfflineReady] = useState(false);
  const [offlineDownload, setOfflineDownload] = useState<{
    done: number;
    total: number;
    running: boolean;
  } | null>(null);
  const [offlineDownloadError, setOfflineDownloadError] =
    useState<string | null>(null);

  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine
  );

  // ── Persistence ─────────────────────────────────────────────────────────────

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    saveLocal(LS_DARK_MODE, darkMode);
  }, [darkMode]);

  useEffect(() => saveLocal(LS_LANGUAGE, language), [language]);
  useEffect(() => saveLocal(LS_SETTINGS_LANG, settingsLang), [settingsLang]);
  useEffect(() => saveLocal(LS_FAVORITES, favorites), [favorites]);
  useEffect(
    () => saveLocal(LS_RECENTLY_VIEWED, recentlyViewed),
    [recentlyViewed]
  );
  useEffect(
    () => saveLocal(LS_RECENT_SEARCHES, recentSearches),
    [recentSearches]
  );
  useEffect(() => saveLocal(LS_FONT_SIZE, fontSize), [fontSize]);
  useEffect(
    () => saveLocal(LS_REMINDER_ENABLED, reminderEnabled),
    [reminderEnabled]
  );
  useEffect(() => saveLocal(LS_REMINDER_TIME, reminderTime), [reminderTime]);

  useEffect(() => {
    const update = () => setIsOnline(navigator.onLine);

    window.addEventListener("online", update);
    window.addEventListener("offline", update);

    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  useEffect(() => {
    cacheGet<boolean>(OFFLINE_READY_KEY).then((value) =>
      setOfflineReady(Boolean(value))
    );
  }, []);

  // ── Catalog Loading ─────────────────────────────────────────────────────────

  const loadCatalog = useCallback(
    async (options?: { force?: boolean; silent?: boolean }) => {
      if (!options?.silent) {
        setHymnsLoading(true);
      }

      setHymnsError(null);

      try {
        const data = options?.force
          ? await getCatalogFresh()
          : await getCatalogCached();

        setHymns(data);
      } catch (error) {
        setHymnsError(
          error instanceof Error ? error.message : "Failed to load hymns."
        );
      } finally {
        if (!options?.silent) {
          setHymnsLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    loadCatalog();

    refreshCatalogInBackground((fresh) => {
      setHymns(fresh);
    });
  }, [loadCatalog]);

  // ── Derived Data ────────────────────────────────────────────────────────────

  const categories = useMemo(
    () => buildCategoriesFromHymns(hymns),
    [hymns]
  );

  const hymnOfTheDay = useMemo(() => {
    if (!hymns.length) return null;

    const today = new Date();
    const index = (today.getDay() + today.getDate()) % hymns.length;

    return hymns[index];
  }, [hymns]);

  const [hymnOfTheDayDetail, setHymnOfTheDayDetail] =
    useState<Hymn | null>(null);

  useEffect(() => {
    let alive = true;

    if (!hymnOfTheDay) {
      setHymnOfTheDayDetail(null);
      return;
    }

    getHymnCached(hymnOfTheDay)
      .then((hymn) => {
        if (alive) setHymnOfTheDayDetail(hymn);
      })
      .catch(() => {
        if (alive) setHymnOfTheDayDetail(null);
      });

    return () => {
      alive = false;
    };
  }, [hymnOfTheDay?.id]);

  const recentHymns = useMemo(
    () =>
      recentlyViewed
        .map((id) => hymns.find((h) => h.id === id))
        .filter(Boolean) as HymnSummary[],
    [recentlyViewed, hymns]
  );

  const favoriteHymns = useMemo(
    () =>
      favorites
        .map((id) => hymns.find((h) => h.id === id))
        .filter(Boolean) as HymnSummary[],
    [favorites, hymns]
  );

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    if (!q) return [];

    return hymns.filter((h) => {
      return (
        h.number.toString().includes(q) ||
        displayHymnNumber(h).toLowerCase().includes(q) ||
        h.titleEn.toLowerCase().includes(q) ||
        h.titleYo.toLowerCase().includes(q) ||
        h.categoryEn.toLowerCase().includes(q) ||
        h.categoryYo.toLowerCase().includes(q) ||
        h.hymnType.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, hymns]);

  const byNumber = useMemo(
    () =>
      searchResults.filter((h) => {
        const q = searchQuery.trim().toLowerCase();

        return (
          h.number.toString().includes(q) ||
          displayHymnNumber(h).toLowerCase().includes(q)
        );
      }),
    [searchResults, searchQuery]
  );

  const byTitle = useMemo(
    () =>
      searchResults.filter((h) => {
        const q = searchQuery.trim().toLowerCase();

        return (
          h.titleEn.toLowerCase().includes(q) ||
          h.titleYo.toLowerCase().includes(q)
        );
      }),
    [searchResults, searchQuery]
  );

  const byCategory = useMemo(
    () =>
      searchResults.filter((h) => {
        const q = searchQuery.trim().toLowerCase();

        return (
          h.categoryEn.toLowerCase().includes(q) ||
          h.categoryYo.toLowerCase().includes(q) ||
          h.hymnType.toLowerCase().includes(q)
        );
      }),
    [searchResults, searchQuery]
  );

  useEffect(() => {
    let alive = true;

    const q = searchQuery.trim();

    if (!q || !offlineReady) {
      setLyricsResults([]);
      setLyricsSearchLoading(false);
      return;
    }

    setLyricsSearchLoading(true);

    const timer = window.setTimeout(async () => {
      try {
        const results = await searchCachedLyrics(hymns, q);

        if (alive) {
          setLyricsResults(results);
        }
      } finally {
        if (alive) {
          setLyricsSearchLoading(false);
        }
      }
    }, 350);

    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [searchQuery, offlineReady, hymns]);

  const showBottomNav = screen !== "onboarding" && screen !== "hymn-detail";

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const tr = (en: string, yo: string) => (language === "en" ? en : yo);

  const hymnTitle = (h: HymnSummary, lang?: Language) =>
    (lang ?? language) === "en" ? h.titleEn : h.titleYo;

  const hymnOtherTitle = (h: HymnSummary, lang?: Language) =>
    (lang ?? language) === "en" ? h.titleYo : h.titleEn;

  const hymnCategoryName = (h: HymnSummary) =>
    language === "en" ? h.categoryEn : h.categoryYo;

  const openHymn = async (hymn: HymnSummary, from?: Screen) => {
    const requestId = openRequestId.current + 1;
    openRequestId.current = requestId;

    setPrevScreen(from ?? screen);
    setPendingHymn(hymn);
    setSelectedHymn(null);
    setHymnDetailLoading(true);
    setHymnDetailError(null);
    setHymnLang(language);
    setMetaExpanded(false);

    setRecentlyViewed((prev) =>
      [hymn.id, ...prev.filter((id) => id !== hymn.id)].slice(0, 12)
    );

    setScreen("hymn-detail");

    try {
      const fullHymn = await getHymnCached(hymn);

      if (openRequestId.current === requestId) {
        setSelectedHymn(fullHymn);
      }
    } catch (error) {
      if (openRequestId.current === requestId) {
        setHymnDetailError(
          error instanceof Error ? error.message : "Could not load hymn."
        );
      }
    } finally {
      if (openRequestId.current === requestId) {
        setHymnDetailLoading(false);
      }
    }
  };

  const goBack = () => {
    openRequestId.current += 1;

    setScreen(prevScreen);
    setSelectedHymn(null);
    setPendingHymn(null);
    setHymnDetailLoading(false);
    setHymnDetailError(null);

    if (
      [
        "home",
        "search",
        "categories",
        "category-detail",
        "favorites",
        "settings",
      ].includes(prevScreen)
    ) {
      const tabMap: Record<string, Tab> = {
        home: "home",
        search: "search",
        categories: "categories",
        "category-detail": "categories",
        favorites: "favorites",
        settings: "settings",
      };

      setActiveTab(tabMap[prevScreen] ?? "home");
    }
  };

  const openAllHymns = () => {
    setSelectedCategory(null);
    setSelectedHymn(null);
    setPendingHymn(null);
    setHymnDetailError(null);
    setPrevScreen("home");
    setActiveTab("home");
    setScreen("all-hymns");
  };

  const navigateTab = (tab: Tab) => {
    openRequestId.current += 1;

    setActiveTab(tab);

    const m: Record<Tab, Screen> = {
      home: "home",
      search: "search",
      categories: "categories",
      favorites: "favorites",
      settings: "settings",
    };

    setScreen(m[tab]);
    setSelectedHymn(null);
    setPendingHymn(null);
    setSelectedCategory(null);
    setHymnDetailError(null);
  };

  const toggleFavorite = (id: number) => {
    setHeartPulse(true);
    setTimeout(() => setHeartPulse(false), 700);

    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDownloadAll = async () => {
    if (!hymns.length || offlineDownload?.running) return;

    setOfflineDownloadError(null);
    setOfflineDownload({
      done: 0,
      total: hymns.length,
      running: true,
    });

    const result = await downloadAllHymns(hymns, (done, total) => {
      setOfflineDownload({
        done,
        total,
        running: done < total,
      });
    });

    if (result.failed === 0) {
      setOfflineReady(true);
      await cacheSet<boolean>(OFFLINE_READY_KEY, true);
      setOfflineDownload({
        done: hymns.length,
        total: hymns.length,
        running: false,
      });
    } else {
      setOfflineReady(false);
      await cacheSet<boolean>(OFFLINE_READY_KEY, false);
      setOfflineDownloadError(
        `${result.failed} hymns could not be downloaded. Please check your connection and try again.`
      );
      setOfflineDownload((prev) =>
        prev
          ? {
            ...prev,
            running: false,
          }
          : null
      );
    }
  };

  const handleClearAllData = async () => {
    setFavorites([]);
    setRecentlyViewed([]);
    setRecentSearches([]);
    setSwipedFavId(null);
    setOfflineReady(false);
    setOfflineDownload(null);
    setOfflineDownloadError(null);

    await cacheClear();
    await loadCatalog({ force: true, silent: true });
  };

  const handleShareHymn = async () => {
    if (!selectedHymn) return;

    const title = hymnTitle(selectedHymn, hymnLang);
    const lyrics = selectedHymn.verses
      .map((verse) => {
        const lines = hymnLang === "en" ? verse.en : verse.yo;
        return `${tr("Verse", "Ẹsẹ")} ${verse.number}\n${lines.join("\n")}`;
      })
      .join("\n\n");

    const chorus = selectedHymn.chorus
      ? `\n\n${tr("Chorus", "Orin Àárín")}\n${(
        hymnLang === "en" ? selectedHymn.chorus.en : selectedHymn.chorus.yo
      ).join("\n")}`
      : "";

    const text = `${title}\nCAC Gospel Hymnal #${displayHymnNumber(
      selectedHymn
    )}\n\n${lyrics}${chorus}`;

    try {
      if (typeof navigator !== "undefined" && "share" in navigator) {
        await navigator.share({
          title,
          text,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
    } catch {
      // User cancelled or sharing failed.
    }
  };

  useEffect(() => {
    if (
      screen === "home" &&
      hymns.length > 0 &&
      !devotionalShown.current &&
      reminderEnabled
    ) {
      devotionalShown.current = true;

      const t = setTimeout(() => setShowDevotional(true), 1800);
      return () => clearTimeout(t);
    }
  }, [screen, hymns.length, reminderEnabled]);

  // ── Status Bar ──────────────────────────────────────────────────────────────

  const StatusBar = () => (
    <div className="flex items-center justify-between px-6 pt-3 pb-1 flex-shrink-0">
      <span className="text-xs font-semibold text-foreground">9:41</span>

      <div className="flex items-center gap-1 text-foreground">
        {isOnline ? (
          <Wifi className="w-3.5 h-3.5" />
        ) : (
          <WifiOff className="w-3.5 h-3.5 text-red-500" />
        )}

        <svg width="22" height="11" viewBox="0 0 22 11" fill="currentColor">
          <rect
            x="0"
            y="1"
            width="18"
            height="9"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.2"
            fill="none"
          />
          <rect x="18.8" y="3.5" width="2.2" height="4" rx="1" opacity="0.5" />
          <rect x="1.5" y="2.5" width="13" height="6" rx="1.2" />
        </svg>
      </div>
    </div>
  );

  // ── Bottom Nav ──────────────────────────────────────────────────────────────

  const BottomNav = () => {
    const tabs: { id: Tab; Icon: ElementType; en: string; yo: string }[] = [
      { id: "home", Icon: Home, en: "Home", yo: "Ilé" },
      { id: "search", Icon: Search, en: "Search", yo: "Ìwádìí" },
      { id: "categories", Icon: Grid3X3, en: "Categories", yo: "Ẹ̀ka" },
      { id: "favorites", Icon: Heart, en: "Favorites", yo: "Àyọ̀ Mi" },
      { id: "settings", Icon: Settings, en: "Settings", yo: "Ìtòlẹ́sẹẹ̀" },
    ];

    return (
      <div className="flex items-center justify-around px-1 py-2 border-t border-border bg-card flex-shrink-0">
        {tabs.map(({ id, Icon, en, yo }) => {
          const active = activeTab === id;

          return (
            <button
              key={id}
              onClick={() => navigateTab(id)}
              className="flex flex-col items-center gap-0.5 px-2 py-1"
            >
              <div className="relative">
                <Icon
                  className={`w-[22px] h-[22px] transition-colors ${active ? "text-primary" : "text-muted-foreground"
                    }`}
                />

                {id === "favorites" && favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-[#D4A017] rounded-full text-[8px] flex items-center justify-center text-white font-bold leading-none">
                    {favorites.length}
                  </span>
                )}
              </div>

              <span
                className={`text-[9px] font-semibold leading-none transition-colors ${active ? "text-primary" : "text-muted-foreground"
                  }`}
              >
                {language === "en" ? en : yo}
              </span>

              {active && (
                <div className="w-1 h-1 rounded-full bg-[#D4A017] mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    );
  };

  // ── Screen: Onboarding ──────────────────────────────────────────────────────

  const renderOnboarding = () => (
    <div
      className="flex flex-col h-full relative overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, #1A237E 0%, #283593 60%, #1565C0 100%)",
      }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute top-1/2 -left-20 w-56 h-56 rounded-full bg-white/5" />
        <div
          className="absolute bottom-1/3 right-4 w-40 h-40 rounded-full"
          style={{ background: "rgba(212,160,23,0.15)" }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      <div className="relative flex flex-col items-center justify-center flex-1 px-8 gap-7 pt-8">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-28 h-28 rounded-[32px] flex items-center justify-center"
          style={{
            background: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(12px)",
            border: "1.5px solid rgba(255,255,255,0.2)",
          }}
        >
          <HymnBookLogo size={64} light />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center"
        >
          <h1 className="text-[26px] font-bold text-white tracking-tight leading-tight">
            CAC Gospel Hymnal
          </h1>
          <p className="text-white/60 text-sm mt-1 font-medium">
            Christ Apostolic Church
          </p>
        </motion.div>

        <motion.p
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="text-white/75 text-center text-sm leading-relaxed max-w-[270px]"
        >
          {onboardLang === "en"
            ? "Sing praises to the Lord with CAC hymns in English and Yoruba."
            : "Korin orin ìyin sí Oluwa pẹ̀lú orin CAC ní Gẹ̀ẹ́sì àti Yorùbá."}
        </motion.p>

        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="w-full"
        >
          <p className="text-white/50 text-[10px] text-center mb-2.5 uppercase tracking-[0.15em] font-semibold">
            Choose Language
          </p>

          <div
            className="flex rounded-2xl overflow-hidden border p-1 gap-1"
            style={{
              borderColor: "rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.1)",
            }}
          >
            {(["en", "yo"] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setOnboardLang(lang)}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${onboardLang === lang
                  ? "bg-white text-[#1A237E] shadow-md"
                  : "text-white/70 hover:text-white"
                  }`}
              >
                {lang === "en" ? "🇬🇧  English" : "🇳🇬  Yorùbá"}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.65 }}
        className="relative px-6 pb-10"
      >
        <button
          onClick={() => {
            setLanguage(onboardLang);
            setSettingsLang(onboardLang);
            saveLocal(LS_ONBOARDED, true);
            setScreen("home");
            setActiveTab("home");
          }}
          className="w-full py-4 rounded-2xl font-bold text-[15px] shadow-xl active:scale-95 transition-transform"
          style={{ background: "#D4A017", color: "#1A1A2E" }}
        >
          {onboardLang === "en" ? "Get Started →" : "Bẹ̀rẹ̀ Sísinú →"}
        </button>

        <p className="text-white/35 text-[11px] text-center mt-3">
          {onboardLang === "en"
            ? "You can change language in Settings anytime"
            : "O le yipada èdè ninu Ètò ni igba eyikeyi"}
        </p>
      </motion.div>
    </div>
  );

  // ── Screen: Home ────────────────────────────────────────────────────────────

  const renderHome = () => {
    if (hymnsLoading && hymns.length === 0) {
      return (
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-5 pt-1 pb-3 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <HymnBookLogo size={30} />
              <div>
                <p className="text-[10px] text-muted-foreground leading-none font-medium uppercase tracking-wider">
                  CAC Gospel Hymnal
                </p>
                <p className="text-sm font-bold text-foreground leading-tight mt-0.5">
                  {tr("Loading hymns…", "Ń ṣí àwọn orin…")}
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
            <p className="text-sm text-muted-foreground">
              {tr(
                "Fetching CAC hymnal from Hymnize…",
                "Ń gba iwe orin CAC láti Hymnize…"
              )}
            </p>
          </div>
        </div>
      );
    }

    if (hymnsError && hymns.length === 0) {
      return (
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-5 pt-1 pb-3 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <HymnBookLogo size={30} />
              <div>
                <p className="text-[10px] text-muted-foreground leading-none font-medium uppercase tracking-wider">
                  CAC Gospel Hymnal
                </p>
                <p className="text-sm font-bold text-foreground leading-tight mt-0.5">
                  {tr("Could not load hymns", "A kò lè ṣí àwọn orin")}
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
            <WifiOff className="w-10 h-10 text-red-400 mb-3" />
            <p className="font-bold text-foreground mb-1">
              {tr("Connection problem", "Ìṣòro ìbánisọ̀rọ̀")}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              {hymnsError}
            </p>
            <button
              onClick={() => loadCatalog({ force: true })}
              className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              {tr("Try Again", "Gbìyànjú Lẹ́ẹ̀kansi")}
            </button>
          </div>
        </div>
      );
    }

    const hymnDayLine =
      hymnOfTheDayDetail?.verses[0]?.[language === "en" ? "en" : "yo"]?.[0] ??
      (hymnOfTheDay ? hymnCategoryName(hymnOfTheDay) : "");

    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-5 pt-1 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <HymnBookLogo size={30} />

            <div>
              <p className="text-[10px] text-muted-foreground leading-none font-medium uppercase tracking-wider">
                CAC Gospel Hymnal
              </p>
              <p className="text-sm font-bold text-foreground leading-tight mt-0.5">
                {tr("Good Morning ☀️", "Ẹ káàárọ̀ ☀️")}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowDevotional(true)}
            className="relative w-9 h-9 rounded-full bg-muted flex items-center justify-center"
          >
            <Bell className="w-[18px] h-[18px] text-foreground" />
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
              style={{ background: "#D4A017" }}
            />
          </button>
        </div>

        <div
          className="flex-1 overflow-y-auto pb-3 space-y-5"
          style={{ scrollbarWidth: "none" }}
        >
          {hymnOfTheDay && (
            <div className="px-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em] mb-2">
                {tr("Hymn of the Day", "Orin Ọjọ Oni")}
              </p>

              <div className="rounded-[20px] bg-primary overflow-hidden relative">
                <div className="absolute right-3 top-3 opacity-[0.07]">
                  <svg width="90" height="90" viewBox="0 0 48 48" fill="white">
                    <path d="M24 8 C16 8 5 11 3 14 L3 43 C5 40 16 38 24 38 C32 38 43 40 45 43 L45 14 C43 11 32 8 24 8Z" />
                    <line
                      x1="24"
                      y1="8"
                      x2="24"
                      y2="38"
                      strokeWidth="3"
                      stroke="white"
                    />
                  </svg>
                </div>

                <div className="relative p-5">
                  <div className="flex items-start justify-between mb-3">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold"
                      style={{
                        background: "rgba(212,160,23,0.25)",
                        color: "#D4A017",
                        border: "1px solid rgba(212,160,23,0.35)",
                      }}
                    >
                      <Star className="w-3 h-3 fill-current" />
                      {tr("Featured", "Àkọ́ Orin")}
                    </span>

                    <span className="text-white/20 text-4xl font-black leading-none">
                      #{displayHymnNumber(hymnOfTheDay)}
                    </span>
                  </div>

                  <h3 className="text-[20px] font-bold text-white leading-snug">
                    {hymnTitle(hymnOfTheDay)}
                  </h3>

                  <p className="text-white/55 text-xs mt-1.5 mb-4 line-clamp-2 leading-relaxed">
                    {hymnDayLine}
                  </p>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => void openHymn(hymnOfTheDay, "home")}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold shadow-md active:scale-95 transition-transform"
                      style={{ background: "#D4A017", color: "#1A1A2E" }}
                    >
                      <Music className="w-4 h-4" />
                      {tr("Sing Now", "Korin Báyìí")}
                    </button>

                    <span className="text-white/40 text-xs capitalize truncate">
                      {hymnCategoryName(hymnOfTheDay)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {recentHymns.length > 0 && (
            <div>
              <div className="flex items-center justify-between px-4 mb-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em]">
                  {tr("Recently Viewed", "Tí a Ṣẹ̀ṣẹ̀ Wò")}
                </p>
              </div>

              <div
                className="flex gap-2.5 px-4 overflow-x-auto pb-1"
                style={{ scrollbarWidth: "none" }}
              >
                {recentHymns.map((hymn) => (
                  <button
                    key={hymn.id}
                    onClick={() => void openHymn(hymn, "home")}
                    className="flex-shrink-0 w-[118px] bg-card border border-border rounded-2xl p-3 text-left active:scale-95 transition-transform"
                  >
                    <span
                      className="text-[11px] font-black"
                      style={{ color: "#D4A017" }}
                    >
                      #{displayHymnNumber(hymn)}
                    </span>

                    <p className="text-foreground text-xs font-semibold mt-1 line-clamp-2 leading-snug">
                      {hymnTitle(hymn)}
                    </p>

                    <p className="text-muted-foreground text-[10px] mt-1 capitalize truncate">
                      {hymnCategoryName(hymn)}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="px-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em] mb-3">
              {tr("Quick Access", "Ìráàyèsí Iyára")}
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                {
                  Icon: BookOpen,
                  en: "All Hymns",
                  yo: "Gbogbo Orin",
                  color: "#1A237E",
                  bg: "#E8EAFB",
                  action: openAllHymns,
                },
                {
                  Icon: Heart,
                  en: "Favorites",
                  yo: "Àyọ̀ Mi",
                  color: "#C62828",
                  bg: "#FFEBEE",
                  action: () => navigateTab("favorites"),
                },
                {
                  Icon: Grid3X3,
                  en: "Categories",
                  yo: "Ẹ̀ka",
                  color: "#2E7D32",
                  bg: "#E8F5E9",
                  action: () => navigateTab("categories"),
                },
                {
                  Icon: Search,
                  en: "Search",
                  yo: "Ìwádìí",
                  color: "#B8860B",
                  bg: "#FDF3DC",
                  action: () => navigateTab("search"),
                },
              ].map(({ Icon, en, yo, color, bg, action }) => (
                <button
                  key={en}
                  onClick={action}
                  className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 active:scale-95 transition-all text-left hover:border-primary/20"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: bg }}
                  >
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>

                  <span className="text-[13px] font-semibold text-foreground">
                    {language === "en" ? en : yo}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="px-4 pb-2">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em]">
                {tr("Browse Hymns", "Ìwò Àwọn Orin")}
              </p>

              <span className="text-[10px] text-muted-foreground">
                {hymns.length} {tr("hymns", "orin")}
              </span>
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
              {hymns.slice(0, 8).map((hymn) => (
                <button
                  key={hymn.id}
                  onClick={() => void openHymn(hymn, "home")}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                >
                  <span
                    className="font-black text-sm w-10 flex-shrink-0"
                    style={{ color: "#D4A017" }}
                  >
                    {displayHymnNumber(hymn)}
                  </span>

                  <div className="flex-1 min-w-0">
                    <p className="text-foreground text-sm font-semibold truncate">
                      {hymnTitle(hymn)}
                    </p>

                    <p className="text-muted-foreground text-[11px] truncate">
                      {hymnOtherTitle(hymn)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {favorites.includes(hymn.id) && (
                      <Heart className="w-3.5 h-3.5 text-red-400 fill-current" />
                    )}

                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── Screen: Hymn Detail ─────────────────────────────────────────────────────

  const renderHymnDetail = () => {
    const headingHymn = selectedHymn ?? pendingHymn;

    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-4 pt-1 pb-3 border-b border-border flex-shrink-0">
          <button
            onClick={goBack}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0"
          >
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>

          <span className="text-muted-foreground text-sm font-semibold flex-1">
            {headingHymn
              ? `Hymn #${displayHymnNumber(headingHymn)}`
              : tr("Hymn", "Orin")}
          </span>

          <div className="flex rounded-full border border-border bg-muted p-0.5 gap-0.5">
            {(["en", "yo"] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setHymnLang(lang)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${hymnLang === lang
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground"
                  }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {hymnDetailLoading && (
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
            <p className="font-semibold text-foreground">
              {tr("Loading hymn…", "Orin ń ṣí…")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {headingHymn ? hymnTitle(headingHymn) : ""}
            </p>
          </div>
        )}

        {!hymnDetailLoading && hymnDetailError && (
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
            <FileText className="w-10 h-10 text-muted-foreground mb-3" />
            <p className="font-bold text-foreground mb-1">
              {tr("Could not load hymn", "A kò lè ṣí orin")}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              {hymnDetailError}
            </p>
            {headingHymn && (
              <button
                onClick={() => void openHymn(headingHymn, prevScreen)}
                className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                {tr("Retry", "Gbìyànjú")}
              </button>
            )}
          </div>
        )}

        {!hymnDetailLoading && !hymnDetailError && selectedHymn && (
          <>
            <div
              className="flex-1 overflow-y-auto pb-20"
              style={{ scrollbarWidth: "none" }}
            >
              <div className="px-5 pt-5 pb-4">
                <motion.h1
                  key={hymnLang + selectedHymn.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22 }}
                  className="text-[22px] font-bold text-foreground leading-snug"
                >
                  {hymnTitle(selectedHymn, hymnLang)}
                </motion.h1>

                <p className="text-muted-foreground text-sm mt-1">
                  {hymnOtherTitle(selectedHymn, hymnLang)}
                </p>

                <p className="text-muted-foreground text-xs mt-1.5 font-medium">
                  {hymnLang === "en"
                    ? selectedHymn.categoryEn
                    : selectedHymn.categoryYo}
                </p>
              </div>

              <div className="px-5 space-y-7">
                {selectedHymn.verses.map((verse) => (
                  <motion.div
                    key={`${verse.number}-${hymnLang}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: verse.number * 0.03 }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className="text-[10px] font-black uppercase tracking-[0.15em]"
                        style={{ color: "#D4A017" }}
                      >
                        {tr("Verse", "Ẹsẹ")} {verse.number}
                      </span>

                      <div className="flex-1 h-px bg-border" />
                    </div>

                    <div className="space-y-2">
                      {(hymnLang === "en" ? verse.en : verse.yo).map(
                        (line, i) => (
                          <p
                            key={i}
                            className="text-foreground leading-[1.8]"
                            style={{ fontSize: `${fontSize}px` }}
                          >
                            {line}
                          </p>
                        )
                      )}
                    </div>
                  </motion.div>
                ))}

                {selectedHymn.chorus && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                    className="rounded-2xl p-4"
                    style={{
                      background: "rgba(26,35,126,0.05)",
                      border: "1px solid rgba(26,35,126,0.12)",
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-[10px] font-black text-primary uppercase tracking-[0.15em]">
                        {tr("Chorus", "Orin Àárín")}
                      </span>

                      <div
                        className="flex-1 h-px"
                        style={{ background: "rgba(26,35,126,0.15)" }}
                      />
                    </div>

                    <div className="space-y-2">
                      {(hymnLang === "en"
                        ? selectedHymn.chorus.en
                        : selectedHymn.chorus.yo
                      ).map((line, i) => (
                        <p
                          key={i}
                          className="text-foreground leading-[1.8] font-medium italic"
                          style={{ fontSize: `${fontSize}px` }}
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="mx-5 mt-7 mb-4 border border-border rounded-2xl overflow-hidden">
                <button
                  onClick={() => setMetaExpanded(!metaExpanded)}
                  className="w-full flex items-center justify-between px-4 py-3.5"
                >
                  <span className="text-sm font-semibold text-foreground">
                    {tr("Hymn Details", "Àlàyé Orin")}
                  </span>

                  <ChevronRight
                    className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${metaExpanded ? "rotate-90" : ""
                      }`}
                  />
                </button>

                <AnimatePresence>
                  {metaExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-border px-4 pb-4 pt-3 space-y-2.5">
                        {[
                          {
                            label: tr("Category", "Ẹ̀ka"),
                            value:
                              hymnLang === "en"
                                ? selectedHymn.categoryEn
                                : selectedHymn.categoryYo,
                          },
                          {
                            label: tr("Hymn Number", "Nọ́mbà Orin"),
                            value: `#${displayHymnNumber(selectedHymn)}`,
                          },
                          {
                            label: tr("Type", "Irú"),
                            value: selectedHymn.hymnType,
                          },
                          {
                            label: tr("Meter", "Mítà"),
                            value: selectedHymn.meter ?? "—",
                          },
                          {
                            label: tr("Scripture", "Ìwé Mímọ́"),
                            value: selectedHymn.scripture ?? "—",
                          },
                          {
                            label: tr("Verses", "Àwọn Ẹsẹ"),
                            value: String(selectedHymn.verses.length),
                          },
                        ].map((row) => (
                          <div
                            key={row.label}
                            className="flex justify-between items-center gap-4"
                          >
                            <span className="text-xs text-muted-foreground">
                              {row.label}
                            </span>

                            <span className="text-xs font-semibold text-foreground capitalize text-right">
                              {row.value}
                            </span>
                          </div>
                        ))}

                        <button
                          onClick={handleShareHymn}
                          className="w-full mt-2 flex items-center justify-center gap-2 bg-muted py-2.5 rounded-xl text-sm font-semibold text-foreground"
                        >
                          <Share2 className="w-4 h-4" />
                          {tr("Share Hymn", "Pín Orin")}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="absolute bottom-5 right-5 z-10">
              <motion.button
                onClick={() => toggleFavorite(selectedHymn.id)}
                animate={
                  heartPulse && favorites.includes(selectedHymn.id)
                    ? { scale: [1, 1.35, 0.85, 1.12, 1] }
                    : {}
                }
                transition={{ duration: 0.55 }}
                className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-colors ${favorites.includes(selectedHymn.id)
                  ? "bg-red-500 text-white"
                  : "bg-card border border-border text-muted-foreground"
                  }`}
              >
                <Heart
                  className={`w-6 h-6 transition-all ${favorites.includes(selectedHymn.id) ? "fill-current" : ""
                    }`}
                />
              </motion.button>
            </div>
          </>
        )}
      </div>
    );
  };

  // ── Screen: Search ──────────────────────────────────────────────────────────

  const renderSearch = () => {
    const hasSearchQuery = Boolean(searchQuery.trim());

    const hasAnySearchResults =
      byNumber.length > 0 ||
      byTitle.length > 0 ||
      byCategory.length > 0 ||
      lyricsResults.length > 0 ||
      lyricsSearchLoading;

    return (
      <div className="flex flex-col h-full">
        <div className="px-4 pt-1 pb-3 flex-shrink-0">
          <h2 className="text-lg font-bold text-foreground mb-3">
            {tr("Search Hymns", "Ìwádìí Orin")}
          </h2>

          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  setRecentSearches((prev) =>
                    [
                      searchQuery.trim(),
                      ...prev.filter((s) => s !== searchQuery.trim()),
                    ].slice(0, 6)
                  );
                }
              }}
              placeholder={tr(
                "Search by number, title, category, or lyrics…",
                "Ìwádìí nípasẹ̀ nọ́mbà, àkọlé, ẹ̀ka, tàbí orin…"
              )}
              className="w-full pl-10 pr-9 py-3 bg-muted rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2"
              style={
                { "--tw-ring-color": "rgba(26,35,126,0.25)" } as CSSProperties
              }
            />

            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>

          {!searchQuery && recentSearches.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {recentSearches.map((s) => (
                <button
                  key={s}
                  onClick={() => setSearchQuery(s)}
                  className="bg-muted text-muted-foreground text-xs px-3 py-1.5 rounded-full border border-border hover:text-foreground transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {!offlineReady && (
            <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
              {tr(
                "Tip: download hymns in Settings to enable offline lyrics search.",
                "Àbá: ṣe igbasilẹ orin ninu Ètò lati jẹ́ kí ìwádìí orin ṣiṣẹ́ láìní ìnítánẹ́ẹ̀tì."
              )}
            </p>
          )}
        </div>

        <div
          className="flex-1 overflow-y-auto px-4 pb-4"
          style={{ scrollbarWidth: "none" }}
        >
          {!hasSearchQuery ? (
            <div className="pt-10 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="w-7 h-7 text-muted-foreground" />
              </div>

              <p className="text-muted-foreground text-sm">
                {tr(
                  `Search ${hymns.length || ""} CAC hymns`,
                  `Ìwádìí orin CAC ${hymns.length || ""}`
                )}
              </p>
            </div>
          ) : !hasAnySearchResults ? (
            <div className="pt-14 text-center px-6">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="w-7 h-7 text-muted-foreground" />
              </div>

              <p className="font-bold text-foreground mb-1">
                {tr("No hymns found", "Kò sí orin")}
              </p>

              <p className="text-muted-foreground text-sm">
                {tr(
                  "Try searching in English or Yoruba.",
                  "Gbiyanju ìwádìí ní Gẹ̀ẹ́sì tàbí Yorùbá."
                )}
              </p>
            </div>
          ) : (
            <div className="space-y-5 pt-2">
              {byNumber.length > 0 && (
                <ResultGroup
                  title={tr("By Number", "Nípasẹ̀ Nọ́mbà")}
                  icon={Hash}
                  hymns={byNumber}
                  query={searchQuery}
                  language={language}
                  onOpen={(h) => void openHymn(h, "search")}
                />
              )}

              {byTitle.length > 0 && (
                <ResultGroup
                  title={tr("By Title", "Nípasẹ̀ Àkọlé")}
                  icon={FileText}
                  hymns={byTitle}
                  query={searchQuery}
                  language={language}
                  onOpen={(h) => void openHymn(h, "search")}
                />
              )}

              {byCategory.length > 0 && (
                <ResultGroup
                  title={tr("By Category", "Nípasẹ̀ Ẹ̀ka")}
                  icon={Grid3X3}
                  hymns={byCategory}
                  query={searchQuery}
                  language={language}
                  onOpen={(h) => void openHymn(h, "search")}
                />
              )}

              {lyricsSearchLoading && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs py-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {tr("Searching cached lyrics…", "Ń wá nínú orin tí a pamọ́…")}
                </div>
              )}

              {lyricsResults.length > 0 && (
                <ResultGroup
                  title={tr("By Lyrics", "Nípasẹ̀ Orin")}
                  icon={Music}
                  hymns={lyricsResults}
                  query={searchQuery}
                  language={language}
                  onOpen={(h) => void openHymn(h, "search")}
                />
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── Screen: Categories ──────────────────────────────────────────────────────

  // ── Screen: All Hymns ─────────────────────────────────────────────────────────

  const renderAllHymns = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 pt-1 pb-3 border-b border-border flex-shrink-0">
        <button
          onClick={() => {
            setScreen("home");
            setActiveTab("home");
          }}
          className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0"
        >
          <ChevronLeft className="w-4 h-4 text-foreground" />
        </button>

        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-foreground">
            {tr("All Hymns", "Gbogbo Orin")}
          </h2>

          <p className="text-xs text-muted-foreground">
            {hymns.length} {tr("hymns listed serially", "orin ni títẹ̀lé")}
          </p>
        </div>

        <BookOpen className="w-5 h-5 text-primary" />
      </div>

      <div
        className="flex-1 overflow-y-auto pb-4"
        style={{ scrollbarWidth: "none" }}
      >
        {hymns.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
            <p className="text-sm text-muted-foreground">
              {tr("Loading hymns…", "Ń ṣí àwọn orin…")}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {hymns.map((hymn) => (
              <button
                key={hymn.id}
                onClick={() => void openHymn(hymn, "all-hymns")}
                className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-muted/40 transition-colors text-left"
              >
                <span
                  className="font-black text-sm w-12 flex-shrink-0"
                  style={{ color: "#D4A017" }}
                >
                  {displayHymnNumber(hymn)}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-foreground text-sm font-semibold truncate">
                    {hymnTitle(hymn)}
                  </p>

                  <p className="text-muted-foreground text-[11px] truncate">
                    {hymnOtherTitle(hymn)}
                  </p>

                  <p className="text-muted-foreground text-[10px] truncate mt-0.5">
                    {hymnCategoryName(hymn)}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  {favorites.includes(hymn.id) && (
                    <Heart className="w-3.5 h-3.5 text-red-400 fill-current" />
                  )}

                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );



  const renderCategories = () => (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-1 pb-3 flex-shrink-0">
        <h2 className="text-lg font-bold text-foreground">
          {tr("Categories", "Àwọn Ẹ̀ka")}
        </h2>

        <p className="text-muted-foreground text-sm">
          {tr("Browse hymns by theme", "Wo àwọn orin nípasẹ̀ àkòrí")}
        </p>
      </div>

      <div
        className="flex-1 overflow-y-auto px-4 pb-4"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="grid grid-cols-2 gap-3">
          {categories.map((cat) => {
            const { Icon } = cat;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat);
                  setScreen("category-detail");
                }}
                className="bg-card border border-border rounded-2xl p-4 text-left active:scale-95 transition-all hover:border-primary/20"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: cat.bg }}
                >
                  <Icon className="w-5 h-5" style={{ color: cat.color }} />
                </div>

                <p className="font-bold text-foreground text-[13px] line-clamp-2 leading-snug">
                  {language === "en" ? cat.nameEn : cat.nameYo}
                </p>

                <p className="text-muted-foreground text-xs mt-0.5">
                  {cat.hymnCount} {tr("hymns", "orin")}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ── Screen: Category Detail ─────────────────────────────────────────────────

  const renderCategoryDetail = () => {
    if (!selectedCategory) return null;

    const { Icon } = selectedCategory;

    const catHymns = hymns.filter(
      (h) => h.category === selectedCategory.id
    );

    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-4 pt-1 pb-3 border-b border-border flex-shrink-0">
          <button
            onClick={() => {
              setSelectedCategory(null);
              setScreen("categories");
            }}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
          >
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: selectedCategory.bg }}
            >
              <Icon
                className="w-4 h-4"
                style={{ color: selectedCategory.color }}
              />
            </div>

            <h2 className="text-base font-bold text-foreground truncate">
              {language === "en"
                ? selectedCategory.nameEn
                : selectedCategory.nameYo}
            </h2>
          </div>

          <span className="ml-auto text-xs text-muted-foreground flex-shrink-0">
            {catHymns.length} {tr("hymns", "orin")}
          </span>
        </div>

        <div
          className="flex-1 overflow-y-auto pb-4"
          style={{ scrollbarWidth: "none" }}
        >
          <div className="divide-y divide-border">
            {catHymns.map((hymn) => (
              <button
                key={hymn.id}
                onClick={() => void openHymn(hymn, "category-detail")}
                className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-muted/40 transition-colors text-left"
              >
                <span
                  className="font-black text-sm w-10 flex-shrink-0"
                  style={{ color: "#D4A017" }}
                >
                  {displayHymnNumber(hymn)}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-foreground text-sm font-semibold truncate">
                    {hymnTitle(hymn)}
                  </p>

                  <p className="text-muted-foreground text-[11px] truncate">
                    {hymnOtherTitle(hymn)}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  {favorites.includes(hymn.id) && (
                    <Heart className="w-3.5 h-3.5 text-red-400 fill-current" />
                  )}

                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ── Screen: Favorites ───────────────────────────────────────────────────────

  const renderFavorites = () => (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-1 pb-3 flex-shrink-0">
        <h2 className="text-lg font-bold text-foreground">
          {tr("Favorites", "Àyọ̀ Mi")}
        </h2>

        <p className="text-muted-foreground text-sm">
          {favoriteHymns.length} {tr("saved hymns", "orin tí a pamọ́")}
        </p>
      </div>

      <div
        className="flex-1 overflow-y-auto pb-4"
        style={{ scrollbarWidth: "none" }}
      >
        {favoriteHymns.length === 0 ? (
          <div className="pt-20 text-center px-8">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "#FFF0F0" }}
            >
              <Heart className="w-9 h-9 text-red-200" />
            </div>

            <p className="font-bold text-foreground text-base mb-1">
              {tr("No favorites yet", "Ko sí orin ayọ̀")}
            </p>

            <p className="text-muted-foreground text-sm leading-relaxed">
              {tr(
                "Tap the heart icon while reading a hymn.",
                "Tẹ àmi ọkàn nígbà tí o bá ń ka orin."
              )}
            </p>

            <button
              onClick={() => navigateTab("search")}
              className="mt-5 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-semibold"
            >
              {tr("Find Hymns", "Ìwádìí Orin")}
            </button>
          </div>
        ) : (
          <div className="px-4 space-y-2">
            {favoriteHymns.map((hymn) => (
              <div key={hymn.id} className="relative overflow-hidden rounded-2xl">
                <div className="absolute inset-0 bg-red-500 flex items-center justify-end pr-4 rounded-2xl">
                  <Trash2 className="w-5 h-5 text-white" />
                </div>

                <motion.div
                  animate={{ x: swipedFavId === hymn.id ? -76 : 0 }}
                  transition={{ type: "spring", stiffness: 350, damping: 32 }}
                  className="relative bg-card border border-border rounded-2xl"
                >
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />

                    <span
                      className="font-black text-sm w-10 flex-shrink-0"
                      style={{ color: "#D4A017" }}
                    >
                      {displayHymnNumber(hymn)}
                    </span>

                    <button
                      className="flex-1 min-w-0 text-left"
                      onClick={() =>
                        swipedFavId === hymn.id
                          ? setSwipedFavId(null)
                          : void openHymn(hymn, "favorites")
                      }
                    >
                      <p className="text-foreground text-sm font-semibold truncate">
                        {hymnTitle(hymn)}
                      </p>

                      <p className="text-muted-foreground text-[11px] capitalize truncate">
                        {hymnCategoryName(hymn)}
                      </p>
                    </button>

                    <button
                      onClick={() =>
                        setSwipedFavId(
                          swipedFavId === hymn.id ? null : hymn.id
                        )
                      }
                      className="flex-shrink-0 p-1"
                    >
                      <Heart className="w-5 h-5 text-red-400 fill-current" />
                    </button>
                  </div>
                </motion.div>

                {swipedFavId === hymn.id && (
                  <button
                    onClick={() => {
                      toggleFavorite(hymn.id);
                      setSwipedFavId(null);
                    }}
                    className="absolute right-0 top-0 bottom-0 w-20"
                  />
                )}
              </div>
            ))}

            <p className="text-center text-xs text-muted-foreground pt-2">
              {tr("Tap heart to remove", "Tẹ ọkàn láti yọ")}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // ── Screen: Settings ────────────────────────────────────────────────────────

  const renderSettings = () => (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-1 pb-3 flex-shrink-0">
        <h2 className="text-lg font-bold text-foreground">
          {tr("Settings", "Ìtòlẹ́sẹẹ̀")}
        </h2>
      </div>

      <div
        className="flex-1 overflow-y-auto pb-6 space-y-3 px-4"
        style={{ scrollbarWidth: "none" }}
      >
        <SettingsSection title={tr("Language", "Èdè")} icon={Globe}>
          <div className="space-y-1">
            {(
              [
                ["en", "🇬🇧  English"],
                ["yo", "🇳🇬  Yorùbá"],
                ["auto", `🌐  ${tr("Auto-detect", "Àwárí Adáṣe")}`],
              ] as ["en" | "yo" | "auto", string][]
            ).map(([val, label]) => (
              <button
                key={val}
                onClick={() => {
                  setSettingsLang(val);

                  if (val === "auto") {
                    setLanguage(detectBrowserLanguage());
                  } else {
                    setLanguage(val);
                  }
                }}
                className="w-full flex items-center justify-between py-2.5"
              >
                <span className="text-sm text-foreground">{label}</span>

                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${settingsLang === val
                    ? "border-primary bg-primary"
                    : "border-muted-foreground/40"
                    }`}
                >
                  {settingsLang === val && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </SettingsSection>

        <SettingsSection title={tr("Offline Hymns", "Orin Laini Ayelujara")} icon={DownloadCloud}>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: offlineReady
                    ? "rgba(46,125,50,0.12)"
                    : "rgba(212,160,23,0.14)",
                }}
              >
                {offlineReady ? (
                  <BookOpen className="w-5 h-5 text-green-600" />
                ) : (
                  <DownloadCloud className="w-5 h-5 text-[#B8860B]" />
                )}
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  {offlineReady
                    ? tr("Offline hymns ready", "Àwọn orin ti ṣetan laini ayelujara")
                    : tr("Download all hymns", "Ṣe igbasilẹ gbogbo orin")}
                </p>

                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                  {tr(
                    "This caches English and Yoruba lyrics for offline reading and lyrics search. Recommended on Wi‑Fi.",
                    "Èyí máa pamọ́ orin Gẹ̀ẹ́sì àti Yorùbá fún kika laini ayelujara ati ìwádìí orin. Ó dára lori Wi‑Fi."
                  )}
                </p>
              </div>
            </div>

            <button
              onClick={() => void handleDownloadAll()}
              disabled={!hymns.length || offlineDownload?.running}
              className={`w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 ${offlineDownload?.running
                ? "bg-muted text-muted-foreground"
                : "bg-primary text-primary-foreground"
                }`}
            >
              {offlineDownload?.running ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <DownloadCloud className="w-4 h-4" />
              )}

              {offlineDownload?.running
                ? tr("Downloading…", "Ń ṣe igbasilẹ…")
                : offlineReady
                  ? tr("Refresh offline hymns", "Ṣe imudojuiwọn orin offline")
                  : tr("Download hymns for offline use", "Ṣe igbasilẹ orin fun offline")}
            </button>

            {offlineDownload && (
              <div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: `${offlineDownload.total
                        ? (offlineDownload.done / offlineDownload.total) * 100
                        : 0
                        }%`,
                    }}
                  />
                </div>

                <p className="text-center text-xs text-muted-foreground mt-1.5">
                  {offlineDownload.done} / {offlineDownload.total}{" "}
                  {tr("downloaded", "ti ṣe igbasilẹ")}
                </p>
              </div>
            )}

            {offlineDownloadError && (
              <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">
                {offlineDownloadError}
              </p>
            )}
          </div>
        </SettingsSection>

        <SettingsSection title={tr("Devotional Reminder", "Ìránilétí Ìjọ̀sìn")} icon={Bell}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">
                {tr("Daily reminder", "Ìránilétí ojoojúmọ́")}
              </span>

              <Toggle
                on={reminderEnabled}
                onToggle={() => setReminderEnabled(!reminderEnabled)}
              />
            </div>

            {reminderEnabled && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {tr("Time", "Àkókò")}
                </span>

                <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-xl">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />

                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="text-sm font-semibold bg-transparent text-foreground outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </SettingsSection>

        <SettingsSection title={tr("Lyrics Font Size", "Iwọn Àkọ́ Orin")} icon={FileText}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">A</span>
              <span className="text-sm font-bold text-foreground">
                {fontSize}px
              </span>
              <span className="text-lg font-bold text-muted-foreground">A</span>
            </div>

            <input
              type="range"
              min={12}
              max={24}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />

            <div className="bg-muted rounded-xl p-3">
              <p
                className="text-foreground leading-relaxed"
                style={{ fontSize: `${fontSize}px` }}
              >
                {tr(
                  "Great Shepherd of thy people, hear…",
                  "Olus’agutan eni Re…"
                )}
              </p>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection title={tr("Appearance", "Àwòrán")} icon={darkMode ? Moon : Sun}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {darkMode ? (
                <Moon className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Sun className="w-4 h-4 text-muted-foreground" />
              )}

              <span className="text-sm text-foreground">
                {tr("Dark Mode", "Ipo Dudu")}
              </span>
            </div>

            <Toggle on={darkMode} onToggle={() => setDarkMode(!darkMode)} />
          </div>
        </SettingsSection>

        <SettingsSection title={tr("About", "Nípa")} icon={Info}>
          <div className="space-y-2.5">
            {[
              [tr("App Version", "Ẹya Ohun Èlò"), "1.0.0"],
              [tr("Source", "Orísun"), "Hymnize API"],
              [tr("Denomination", "Ìjọ"), "CAC"],
              [tr("Total Hymns", "Àpapọ̀ Orin"), hymns.length ? String(hymns.length) : "—"],
              [tr("Languages", "Àwọn Èdè"), "English · Yorùbá"],
              [
                tr("Connection", "Ìbánisọ̀rọ̀"),
                isOnline ? tr("Online", "Online") : tr("Offline", "Offline"),
              ],
            ].map(([label, value]) => (
              <div key={String(label)} className="flex justify-between items-center gap-4">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="text-xs font-semibold text-foreground text-right">
                  {value}
                </span>
              </div>
            ))}

            <p className="text-xs text-muted-foreground leading-relaxed pt-1 border-t border-border mt-1">
              {tr(
                "A digital hymnal for CAC congregations worldwide, powered by Hymnize and optimized for offline PWA use.",
                "Iwe orin ìjọsìn alailẹgbẹ fún àwọn ìjọ CAC káàkiri àgbáálá ayé, ti Hymnize ń ṣiṣẹ́ fún ati tí a ṣe fún offline PWA."
              )}
            </p>
          </div>
        </SettingsSection>

        <button
          onClick={() => void handleClearAllData()}
          className="w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 text-red-600 dark:text-red-400"
          style={{ background: "rgba(198,40,40,0.08)" }}
        >
          <Trash2 className="w-4 h-4" />
          {tr("Clear All Data", "Pa Gbogbo Dátà")}
        </button>

        <p className="text-center text-[11px] text-muted-foreground pb-2">
          Made with ♥ for CAC congregations worldwide
        </p>
      </div>
    </div>
  );

  // ── Modal: Devotional Reminder ──────────────────────────────────────────────

  const DevotionalModal = () => {
    if (!hymnOfTheDay) return null;

    const line =
      hymnOfTheDayDetail?.verses[0]?.[language === "en" ? "en" : "yo"]?.[0] ??
      hymnCategoryName(hymnOfTheDay);

    return (
      <AnimatePresence>
        {showDevotional && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-end"
            style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={() => setShowDevotional(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-card rounded-t-3xl p-6 pb-10 shadow-2xl"
            >
              <div className="w-10 h-1 rounded-full bg-border mx-auto mb-5" />

              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: "rgba(212,160,23,0.15)" }}
                >
                  🌅
                </div>

                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-0.5">
                    {tr("Devotional Reminder", "Ìránilétí Ìjọ̀sìn")}
                  </p>

                  <h3 className="text-lg font-bold text-foreground">
                    {tr("Good Morning!", "Ẹ káàárọ̀!")}
                  </h3>
                </div>
              </div>

              <div
                className="rounded-2xl p-4 mb-5"
                style={{
                  background: "rgba(26,35,126,0.05)",
                  border: "1px solid rgba(26,35,126,0.12)",
                }}
              >
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1.5">
                  {tr("Today's Hymn", "Orin Ọjọ Oni")}
                </p>

                <h4 className="text-base font-bold text-foreground">
                  {hymnTitle(hymnOfTheDay)}
                </h4>

                <p className="text-muted-foreground text-xs mt-1.5 italic leading-relaxed">
                  {line}
                </p>
              </div>

              <p className="text-sm text-muted-foreground text-center mb-5">
                {tr("Start your day with praise ✨", "Bẹ̀rẹ̀ ọjọ́ rẹ pẹ̀lú ìyin ✨")}
              </p>

              <button
                onClick={() => {
                  setShowDevotional(false);
                  void openHymn(hymnOfTheDay, screen);
                }}
                className="w-full bg-primary text-primary-foreground py-3.5 rounded-2xl font-bold text-sm mb-2.5"
              >
                {tr("Open Hymn", "Ṣí Orin")}
              </button>

              <button
                onClick={() => setShowDevotional(false)}
                className="w-full py-2.5 text-muted-foreground text-sm font-medium"
              >
                {tr("Dismiss", "Pa")}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  const renderScreen = () => {
    switch (screen) {
      case "onboarding":
        return renderOnboarding();

      case "home":
        return renderHome();

      case "all-hymns":
        return renderAllHymns();

      case "hymn-detail":
        return renderHymnDetail();

      case "search":
        return renderSearch();

      case "categories":
        return renderCategories();

      case "category-detail":
        return renderCategoryDetail();

      case "favorites":
        return renderFavorites();

      case "settings":
        return renderSettings();

      default:
        return renderHome();
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background:
          "linear-gradient(135deg, #1a237e 0%, #283593 40%, #1565c0 100%)",
      }}
    >
      <div
        className="relative w-full max-w-[393px] h-screen max-h-[852px] bg-background overflow-hidden flex flex-col md:rounded-[44px] md:shadow-2xl"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {screen !== "onboarding" && <StatusBar />}

        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={screen}
              initial={{
                opacity: 0,
                x:
                  screen === "hymn-detail"
                    ? 24
                    : screen === "onboarding"
                      ? 0
                      : -8,
              }}
              animate={{ opacity: 1, x: 0 }}
              exit={{
                opacity: 0,
                x: screen === "hymn-detail" ? -24 : 8,
              }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="flex-1 flex flex-col overflow-hidden min-h-0"
            >
              {renderScreen()}
            </motion.div>
          </AnimatePresence>
        </div>

        {showBottomNav && <BottomNav />}

        {screen !== "onboarding" && <DevotionalModal />}
      </div>
    </div>
  );
}