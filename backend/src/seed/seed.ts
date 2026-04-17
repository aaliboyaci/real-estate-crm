import { connect, Types, disconnect } from 'mongoose';
import * as dns from 'dns';
import * as dotenv from 'dotenv';

// Use Google DNS to resolve MongoDB Atlas SRV records
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not set in .env');
  process.exit(1);
}

interface SeedAgent {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isActive: boolean;
}

const agents: SeedAgent[] = [
  {
    _id: new Types.ObjectId(),
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria.garcia@agency.com',
    phone: '+34 612 001 001',
    isActive: true,
  },
  {
    _id: new Types.ObjectId(),
    firstName: 'Carlos',
    lastName: 'Rodriguez',
    email: 'carlos.rodriguez@agency.com',
    phone: '+34 612 002 002',
    isActive: true,
  },
  {
    _id: new Types.ObjectId(),
    firstName: 'Ana',
    lastName: 'Martinez',
    email: 'ana.martinez@agency.com',
    phone: '+34 612 003 003',
    isActive: true,
  },
  {
    _id: new Types.ObjectId(),
    firstName: 'Luis',
    lastName: 'Hernandez',
    email: 'luis.hernandez@agency.com',
    phone: '+34 612 004 004',
    isActive: true,
  },
  {
    _id: new Types.ObjectId(),
    firstName: 'Sofia',
    lastName: 'Lopez',
    email: 'sofia.lopez@agency.com',
    phone: '+34 612 005 005',
    isActive: true,
  },
];

const stages = ['agreement', 'earnest_money', 'title_deed', 'completed'] as const;

function buildStageHistory(
  targetStageIndex: number,
): Array<{ from: string; to: string; transitionedAt: Date; note: string }> {
  const history = [];
  const baseDate = new Date('2026-03-01');

  for (let i = 0; i < targetStageIndex; i++) {
    history.push({
      from: stages[i],
      to: stages[i + 1],
      transitionedAt: new Date(baseDate.getTime() + (i + 1) * 7 * 24 * 3600_000),
      note: `Stage advanced to ${stages[i + 1]}`,
    });
  }

  return history;
}

interface SeedTransaction {
  propertyAddress: string;
  type: string;
  propertyPriceCents: number;
  serviceFeeCents: number;
  listingAgent: Types.ObjectId;
  sellingAgent: Types.ObjectId;
  currentStage: string;
  stageHistory: Array<{ from: string; to: string; transitionedAt: Date; note: string }>;
  commissionSummary: null | {
    agencyCents: number;
    listingAgentCents: number;
    sellingAgentCents: number;
    calculatedAt: Date;
  };
}

const transactions: SeedTransaction[] = [
  // 4 in agreement
  {
    propertyAddress: 'Calle Gran Via 28, Madrid',
    type: 'sale',
    propertyPriceCents: 35000000,
    serviceFeeCents: 1050000,
    listingAgent: agents[0]._id,
    sellingAgent: agents[1]._id,
    currentStage: 'agreement',
    stageHistory: [],
    commissionSummary: null,
  },
  {
    propertyAddress: 'Paseo de Gracia 15, Barcelona',
    type: 'sale',
    propertyPriceCents: 52000000,
    serviceFeeCents: 1560000,
    listingAgent: agents[2]._id,
    sellingAgent: agents[3]._id,
    currentStage: 'agreement',
    stageHistory: [],
    commissionSummary: null,
  },
  {
    propertyAddress: 'Avenida de la Constitución 5, Sevilla',
    type: 'rental',
    propertyPriceCents: 120000,
    serviceFeeCents: 120000,
    listingAgent: agents[0]._id,
    sellingAgent: agents[0]._id,
    currentStage: 'agreement',
    stageHistory: [],
    commissionSummary: null,
  },
  {
    propertyAddress: 'Calle Larios 12, Málaga',
    type: 'sale',
    propertyPriceCents: 28000000,
    serviceFeeCents: 840000,
    listingAgent: agents[4]._id,
    sellingAgent: agents[1]._id,
    currentStage: 'agreement',
    stageHistory: [],
    commissionSummary: null,
  },
  // 3 in earnest_money
  {
    propertyAddress: 'Calle Serrano 42, Madrid',
    type: 'sale',
    propertyPriceCents: 65000000,
    serviceFeeCents: 1950000,
    listingAgent: agents[1]._id,
    sellingAgent: agents[2]._id,
    currentStage: 'earnest_money',
    stageHistory: buildStageHistory(1),
    commissionSummary: null,
  },
  {
    propertyAddress: 'Rambla de Catalunya 30, Barcelona',
    type: 'rental',
    propertyPriceCents: 180000,
    serviceFeeCents: 180000,
    listingAgent: agents[3]._id,
    sellingAgent: agents[3]._id,
    currentStage: 'earnest_money',
    stageHistory: buildStageHistory(1),
    commissionSummary: null,
  },
  {
    propertyAddress: 'Plaza del Pilar 8, Zaragoza',
    type: 'sale',
    propertyPriceCents: 22000000,
    serviceFeeCents: 660000,
    listingAgent: agents[0]._id,
    sellingAgent: agents[4]._id,
    currentStage: 'earnest_money',
    stageHistory: buildStageHistory(1),
    commissionSummary: null,
  },
  // 3 in title_deed
  {
    propertyAddress: 'Calle Colón 18, Valencia',
    type: 'sale',
    propertyPriceCents: 42000000,
    serviceFeeCents: 1260000,
    listingAgent: agents[2]._id,
    sellingAgent: agents[0]._id,
    currentStage: 'title_deed',
    stageHistory: buildStageHistory(2),
    commissionSummary: null,
  },
  {
    propertyAddress: 'Gran Capitán 22, Córdoba',
    type: 'rental',
    propertyPriceCents: 95000,
    serviceFeeCents: 95000,
    listingAgent: agents[4]._id,
    sellingAgent: agents[4]._id,
    currentStage: 'title_deed',
    stageHistory: buildStageHistory(2),
    commissionSummary: null,
  },
  {
    propertyAddress: 'Calle Preciados 9, Madrid',
    type: 'sale',
    propertyPriceCents: 48000000,
    serviceFeeCents: 1440000,
    listingAgent: agents[1]._id,
    sellingAgent: agents[3]._id,
    currentStage: 'title_deed',
    stageHistory: buildStageHistory(2),
    commissionSummary: null,
  },
  // 5 completed (with commission)
  {
    propertyAddress: 'Paseo del Prado 7, Madrid',
    type: 'sale',
    propertyPriceCents: 72000000,
    serviceFeeCents: 2160000,
    listingAgent: agents[0]._id,
    sellingAgent: agents[1]._id,
    currentStage: 'completed',
    stageHistory: buildStageHistory(3),
    commissionSummary: {
      agencyCents: 1080000,
      listingAgentCents: 540000,
      sellingAgentCents: 540000,
      calculatedAt: new Date('2026-03-22'),
    },
  },
  {
    propertyAddress: 'Diagonal 520, Barcelona',
    type: 'sale',
    propertyPriceCents: 38000000,
    serviceFeeCents: 1140000,
    listingAgent: agents[2]._id,
    sellingAgent: agents[2]._id, // same agent
    currentStage: 'completed',
    stageHistory: buildStageHistory(3),
    commissionSummary: {
      agencyCents: 570000,
      listingAgentCents: 570000,
      sellingAgentCents: 0,
      calculatedAt: new Date('2026-03-25'),
    },
  },
  {
    propertyAddress: 'Alameda 14, Málaga',
    type: 'rental',
    propertyPriceCents: 150000,
    serviceFeeCents: 150000,
    listingAgent: agents[3]._id,
    sellingAgent: agents[4]._id,
    currentStage: 'completed',
    stageHistory: buildStageHistory(3),
    commissionSummary: {
      agencyCents: 75000,
      listingAgentCents: 37500,
      sellingAgentCents: 37500,
      calculatedAt: new Date('2026-04-01'),
    },
  },
  {
    propertyAddress: 'Calle Alfonso I 20, Zaragoza',
    type: 'sale',
    propertyPriceCents: 29000000,
    serviceFeeCents: 870000,
    listingAgent: agents[1]._id,
    sellingAgent: agents[0]._id,
    currentStage: 'completed',
    stageHistory: buildStageHistory(3),
    commissionSummary: {
      agencyCents: 435000,
      listingAgentCents: 217500,
      sellingAgentCents: 217500,
      calculatedAt: new Date('2026-04-05'),
    },
  },
  {
    propertyAddress: 'Calle Real 3, Santander',
    type: 'sale',
    propertyPriceCents: 55000000,
    serviceFeeCents: 1650000,
    listingAgent: agents[4]._id,
    sellingAgent: agents[2]._id,
    currentStage: 'completed',
    stageHistory: buildStageHistory(3),
    commissionSummary: {
      agencyCents: 825000,
      listingAgentCents: 412500,
      sellingAgentCents: 412500,
      calculatedAt: new Date('2026-04-10'),
    },
  },
];

async function seed() {
  console.log('Connecting to MongoDB...');
  const connection = await connect(MONGODB_URI!);
  const db = connection.connection.db!;

  console.log('Clearing existing data...');
  await db.collection('agents').deleteMany({});
  await db.collection('transactions').deleteMany({});
  await db.collection('commissions').deleteMany({});

  console.log('Seeding agents...');
  await db.collection('agents').insertMany(
    agents.map((a) => ({
      ...a,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
  );

  console.log('Seeding transactions...');
  const insertedTransactions = await db.collection('transactions').insertMany(
    transactions.map((t) => ({
      ...t,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
  );

  console.log('Seeding commissions for completed transactions...');
  const completedTransactions = transactions
    .filter((t) => t.currentStage === 'completed')
    .map((t, i) => {
      const ids = Object.values(insertedTransactions.insertedIds);
      // Completed transactions start at index 10 (after 4+3+3 non-completed)
      const txId = ids[10 + i];
      const isSameAgent = t.listingAgent.equals(t.sellingAgent);

      const agentBreakdowns = isSameAgent
        ? [
            {
              agent: t.listingAgent,
              role: 'both',
              amountCents: t.commissionSummary!.listingAgentCents,
              percentage: 50,
            },
          ]
        : [
            {
              agent: t.listingAgent,
              role: 'listing',
              amountCents: t.commissionSummary!.listingAgentCents,
              percentage: 25,
            },
            {
              agent: t.sellingAgent,
              role: 'selling',
              amountCents: t.commissionSummary!.sellingAgentCents,
              percentage: 25,
            },
          ];

      return {
        transaction: txId,
        totalServiceFeeCents: t.serviceFeeCents,
        agencyAmountCents: t.commissionSummary!.agencyCents,
        agencyPercentage: 50,
        agentBreakdowns,
        calculatedAt: t.commissionSummary!.calculatedAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

  if (completedTransactions.length > 0) {
    await db.collection('commissions').insertMany(completedTransactions);
  }

  console.log(`Seeded: ${agents.length} agents, ${transactions.length} transactions, ${completedTransactions.length} commissions`);
  console.log('Done!');

  await disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
