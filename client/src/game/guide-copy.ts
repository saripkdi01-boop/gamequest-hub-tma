import type { LanguageCode } from "../../../shared/languages";
import type { GuideId } from "./guides";

type GuideCopy = {
  roster: string;
  active: string;
  choose: string;
  selected: string;
  protocol: string;
  affinity: string;
  safety: string;
  explore: string;
  seasonal: string;
  role: Record<GuideId, string>;
  affinityValue: Record<GuideId, string>;
  protocolValue: Record<GuideId, string>;
  description: Record<GuideId, string>;
};

const en: GuideCopy = {
  roster: "Guide roster", active: "Active guide", choose: "Choose guide", selected: "Guide selected", protocol: "Signature protocol", affinity: "Quest affinity", safety: "Guide selection changes presentation and route guidance only. Rewards, purchases, wallet proof, and referral credit remain server-verified.", explore: "Explore with guide", seasonal: "Seasonal guide",
  role: { nexus: "Gatekeeper", pocket: "Living Console", tonbit: "Web3 Conduit", crosslink: "Cross-Realm Scout", neura: "Cognitive Guide", sosialis: "Signal Weaver", shieldtma: "Account Warden", pixelx: "Achievement Architect", speedrun: "Momentum Runner", legenda: "Season Beacon" },
  affinityValue: { nexus: "Identity & entry", pocket: "Hub & loadout", tonbit: "Vault & shop", crosslink: "Genesis routes", neura: "Mind arena", sosialis: "Groups & referral", shieldtma: "Profile & security", pixelx: "Rank & visual growth", speedrun: "Daily quest", legenda: "Season finale" },
  protocolValue: { nexus: "Anchor Protocol", pocket: "Quick Stack", tonbit: "Pulse Ledger", crosslink: "Route Shift", neura: "Mind Lattice", sosialis: "Echo Link", shieldtma: "Guardian Seal", pixelx: "Rank Bloom", speedrun: "Tempo Burst", legenda: "Crown Vector" },
  description: { nexus: "A luminous sentinel who aligns every run with a trusted route.", pocket: "A compact command deck that turns choices into a clear field plan.", tonbit: "A crystal signal keeper for value systems that must remain verified.", crosslink: "A multi-device explorer who maps resilient paths through the unknown.", neura: "A shifting intelligence that turns pattern recognition into tactical focus.", sosialis: "A network of friendly signals designed for cooperative challenges.", shieldtma: "A protective operator who represents the trust boundary around every player.", pixelx: "A prism-shaped evolution of every visible milestone and leaderboard climb.", speedrun: "A fast route specialist built for decisive daily operations.", legenda: "A floating standard for the achievements players choose to pursue." },
};

const id: GuideCopy = {
  roster: "Roster guide", active: "Guide aktif", choose: "Pilih guide", selected: "Guide dipilih", protocol: "Protokol khas", affinity: "Afinitas quest", safety: "Pilihan guide hanya mengubah presentasi dan panduan rute. Reward, pembelian, proof wallet, dan kredit referral tetap diverifikasi server.", explore: "Jelajahi dengan guide", seasonal: "Guide musiman",
  role: { nexus: "Penjaga Gerbang", pocket: "Konsol Hidup", tonbit: "Konduit Web3", crosslink: "Penjelajah Lintas Realm", neura: "Pemandu Kognitif", sosialis: "Perajut Sinyal", shieldtma: "Penjaga Akun", pixelx: "Arsitek Pencapaian", speedrun: "Pelari Momentum", legenda: "Sinyal Musim" },
  affinityValue: { nexus: "Identitas & masuk", pocket: "Hub & loadout", tonbit: "Vault & toko", crosslink: "Rute Genesis", neura: "Arena Mind", sosialis: "Grup & referral", shieldtma: "Profil & keamanan", pixelx: "Rank & pertumbuhan visual", speedrun: "Quest harian", legenda: "Finale musim" },
  protocolValue: { nexus: "Protokol Jangkar", pocket: "Tumpukan Cepat", tonbit: "Ledger Denyut", crosslink: "Pergeseran Rute", neura: "Kisi Mind", sosialis: "Taut Gema", shieldtma: "Segel Pelindung", pixelx: "Mekar Rank", speedrun: "Ledakan Tempo", legenda: "Vektor Mahkota" },
  description: { nexus: "Penjaga bercahaya yang menyelaraskan setiap run dengan rute tepercaya.", pocket: "Dek perintah ringkas yang mengubah pilihan menjadi rencana lapangan jelas.", tonbit: "Penjaga sinyal kristal untuk sistem nilai yang harus selalu terverifikasi.", crosslink: "Penjelajah multi-perangkat yang memetakan rute tangguh di wilayah tak dikenal.", neura: "Kecerdasan dinamis yang mengubah pengenalan pola menjadi fokus taktis.", sosialis: "Jaringan sinyal ramah untuk tantangan kooperatif.", shieldtma: "Operator pelindung yang mewakili batas kepercayaan setiap pemain.", pixelx: "Evolusi prismatik bagi setiap pencapaian dan kenaikan leaderboard.", speedrun: "Spesialis rute cepat untuk operasi harian yang tegas.", legenda: "Standar mengambang bagi pencapaian yang ingin dikejar pemain." },
};

export function guideCopy(language: LanguageCode): GuideCopy {
  return language === "id" ? id : en;
}
