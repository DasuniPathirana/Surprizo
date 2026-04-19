import { prisma } from './prisma';

interface AssignmentResult {
  items: {
    name: string;
    value: number;
    description: string | null;
    tier: string;
    image: string | null;
  }[];
  totalValue: number;
  isPremium: boolean;
}

export async function assignBoxItems(
  boxId: string,
  userId?: string
): Promise<AssignmentResult> {
  const box = await prisma.mysteryBox.findUnique({
    where: { id: boxId },
    include: {
      boxItems: {
        include: { item: true },
      },
    },
  });

  if (!box) throw new Error('Box not found');

  // Get user preferences if available
  let userPrefs: { interests: string; preferredCategories: string } | null = null;
  if (userId) {
    userPrefs = await prisma.questionnaire.findUnique({
      where: { userId },
      select: { interests: true, preferredCategories: true },
    });
  }

  // Determine if this is a premium outcome
  const roll = Math.random() * 100;
  const isPremium = roll < box.premiumChance;

  // Get available items for this box's category
  const categoryItems = await prisma.item.findMany({
    where: {
      category: box.category === 'RANDOM' ? undefined : box.category,
      stock: { gt: 0 },
    },
  });

  // Separate premium and standard items
  const premiumItems = categoryItems.filter(i => i.tier === 'PREMIUM');
  const standardItems = categoryItems.filter(i => i.tier === 'STANDARD');

  const selectedItems: typeof categoryItems = [];
  let totalValue = 0;

  if (isPremium && premiumItems.length > 0) {
    // Pick 1-2 premium items
    const shuffled = premiumItems.sort(() => Math.random() - 0.5);
    const premiumCount = Math.min(shuffled.length, Math.random() > 0.5 ? 2 : 1);
    for (let i = 0; i < premiumCount && totalValue < box.guaranteedValue * 1.5; i++) {
      selectedItems.push(shuffled[i]);
      totalValue += shuffled[i].value;
    }
  }

  // Fill with standard items to meet guaranteed value
  if (standardItems.length > 0) {
    const shuffledStandard = standardItems.sort(() => Math.random() - 0.5);
    let idx = 0;
    while (totalValue < box.guaranteedValue && idx < shuffledStandard.length) {
      if (!selectedItems.find(s => s.id === shuffledStandard[idx].id)) {
        selectedItems.push(shuffledStandard[idx]);
        totalValue += shuffledStandard[idx].value;
      }
      idx++;
    }
  }

  // Ensure we always have at least one item
  if (selectedItems.length === 0 && categoryItems.length > 0) {
    selectedItems.push(categoryItems[0]);
    totalValue = categoryItems[0].value;
  }

  // Apply personalization boost: if user prefers this category, add a bonus item
  if (userPrefs) {
    try {
      const preferredCats = JSON.parse(userPrefs.preferredCategories) as string[];
      if (preferredCats.includes(box.category) && standardItems.length > selectedItems.length) {
        const bonusItem = standardItems.find(i => !selectedItems.find(s => s.id === i.id));
        if (bonusItem) {
          selectedItems.push(bonusItem);
          totalValue += bonusItem.value;
        }
      }
    } catch {
      // Ignore parse errors
    }
  }

  // Decrement stock
  for (const item of selectedItems) {
    await prisma.item.update({
      where: { id: item.id },
      data: { stock: { decrement: 1 } },
    });
  }

  return {
    items: selectedItems.map(i => ({
      name: i.name,
      value: i.value,
      description: i.description,
      tier: i.tier,
      image: i.image,
    })),
    totalValue,
    isPremium,
  };
}
