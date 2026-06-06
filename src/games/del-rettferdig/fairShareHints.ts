import type { FairShareTask } from './fairShareGenerator';

function getCounts(baskets: Record<string, number[]>): Record<string, number> {
  return Object.fromEntries(
    Object.entries(baskets).map(([name, items]) => [name, items.length])
  );
}

interface MostLeast {
  most: string;
  least: string;
}

function findMostAndLeast(names: string[], counts: Record<string, number>): MostLeast {
  let most = names[0];
  let least = names[0];
  for (const name of names) {
    if ((counts[name] ?? 0) > (counts[most] ?? 0)) most = name;
    if ((counts[name] ?? 0) < (counts[least] ?? 0)) least = name;
  }
  return { most, least };
}

export function getFairShareHint(
  task: FairShareTask,
  baskets: Record<string, number[]>,
  pileCount: number
): string {
  const counts = getCounts(baskets);
  const names = task.personNames;

  // ---- Del likt ----
  if (task.taskType === 'shareFromPile' || task.taskType === 'shareFromPerson') {
    if (pileCount > 0) {
      return 'Husk å fordele alt fra haugen.';
    }
    const { most, least } = findMostAndLeast(names, counts);
    if (counts[most] !== counts[least]) {
      return `${most} har flere enn ${least}. Prøv å flytte fra ${most} til ${least}.`;
    }
    return 'Ikke helt ennå. Alle skal ha like mange.';
  }

  // ---- Like mange ----
  if (task.taskType === 'makeEqual') {
    const { most, least } = findMostAndLeast(names, counts);
    if (counts[most] !== counts[least]) {
      return `${most} har flere enn ${least}. Prøv å gjøre forskjellen mindre.`;
    }
    if (pileCount > 0) {
      return 'Det ligger fortsatt noe i haugen.';
    }
    return 'Ikke helt ennå. De skal ha like mange.';
  }

  // ---- Én mer ----
  if (task.taskType === 'giveOneMore') {
    const maxTarget = Math.max(...names.map(n => task.targetCounts[n] ?? 0));
    const morePerson = names.find(n => (task.targetCounts[n] ?? 0) === maxTarget) ?? names[1];
    const lessPerson = names.find(n => n !== morePerson) ?? names[0];
    const diff = (counts[morePerson] ?? 0) - (counts[lessPerson] ?? 0);

    if (diff === 1 && pileCount > 0) {
      return 'Husk å bruke opp det som ligger i haugen.';
    }
    if (diff < 0) {
      return `${morePerson} skal ha én mer enn ${lessPerson}, men nå har ${lessPerson} mer.`;
    }
    if (diff === 0) {
      return `${morePerson} skal ha akkurat én mer enn ${lessPerson}.`;
    }
    if (diff > 1) {
      return `${morePerson} har for mange. Forskjellen skal bare være én.`;
    }
    if (pileCount > 0) {
      return 'Husk å bruke opp det som ligger i haugen.';
    }
    return 'Sjekk hvem som skal ha én mer.';
  }

  // ---- Dobbelt så mange ----
  const maxTarget = Math.max(...names.map(n => task.targetCounts[n] ?? 0));
  const doublePerson = names.find(n => (task.targetCounts[n] ?? 0) === maxTarget) ?? names[1];
  const singlePerson = names.find(n => n !== doublePerson) ?? names[0];
  const doubleCount = counts[doublePerson] ?? 0;
  const singleCount = counts[singlePerson] ?? 0;

  if (singleCount === 0 || doubleCount === 0) {
    return `${doublePerson} skal ha dobbelt så mange som ${singlePerson}.`;
  }
  if (doubleCount < singleCount) {
    return `Sjekk hvem som skal ha dobbelt så mange.`;
  }
  if (doubleCount < 2 * singleCount) {
    return `${doublePerson} trenger dobbelt så mange som ${singlePerson}.`;
  }
  if (doubleCount > 2 * singleCount) {
    return `${doublePerson} har for mange. Dobbelt betyr akkurat to ganger så mange.`;
  }
  if (pileCount > 0) {
    return 'Husk å bruke opp det som ligger i haugen.';
  }
  return 'Ikke helt ennå. Dobbelt betyr to ganger så mange.';
}
