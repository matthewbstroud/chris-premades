import {actorUtils, compendiumUtils, constants, dialogUtils, errors, genericUtils, itemUtils, socketUtils, tokenUtils, workflowUtils} from '../../../utils.js';

async function skill({trigger: {entity: item, skillId}}) {
    if (!itemUtils.getEquipmentState(item)) return;
    if (skillId !== 'ins') return;
    return {label: 'CHRISPREMADES.Macros.Grovelthrash.Insight', type: 'advantage'};
}
async function damage({workflow}) {
    if (workflow.hitTargets.size !== 1) return;
    if (genericUtils.getIdentifier(workflow.item) === 'grovelthrash2') {
        if (workflow.actor.system.attributes.hp.value < workflow.actor.system.attributes.hp.max / 2) {
            await workflowUtils.bonusDamage(workflow, '2d6[bludgeoning]', {damageType: 'bludgeoning'});
        }
    }
    let selection = await dialogUtils.confirm(workflow.item.name, 'CHRISPREMADES.Macros.Grovelthrash.Damage');
    if (!selection) return;
    await workflowUtils.bonusDamage(workflow, '2d6[bludgeoning]', {damageType: 'bludgeoning'});
    let damageRoll = await new CONFIG.Dice.DamageRoll('1d6[psychic]', {}, {type: 'psychic'}).evaluate();
    damageRoll.toMessage({
        rollMode: 'roll',
        speaker: ChatMessage.implementation.getSpeaker({token: workflow.token}),
        flavor: workflow.item.name
    });
    await workflowUtils.applyDamage([workflow.token], damageRoll.total, 'psychic');
}
async function damageApplication({trigger: {entity: item, token}, workflow, ditem}) {
    if (!item.system.uses.value) return;
    if (actorUtils.hasUsedReaction(item.actor)) return;
    if (!ditem.newHP) return;
    if (tokenUtils.getDistance(token, workflow.token) > 30) return;
    if (!tokenUtils.canSee(token, workflow.token)) return;
    let damageDealt = ditem.damageDetail.reduce((acc, i) => acc + i.value, 0);
    if (!damageDealt) return;
    let selection = await dialogUtils.confirm(item.name, genericUtils.format('CHRISPREMADES.Dialog.Use', {itemName: item.name}), {userId: socketUtils.firstOwner(item.actor, true)});
    if (!selection) return;
    let featureData = await compendiumUtils.getItemFromCompendium(constants.featurePacks.itemFeatures, 'Grovelthrash Reaction', {object: true, getDescription: true, translate: 'CHRISPREMADES.Macros.Grovelthrash.Reaction'});
    if (!featureData) {
        errors.missingPackItem();
        return;
    }
    featureData.system.damage.parts[0][0] = damageDealt;
    await workflowUtils.syntheticItemDataRoll(featureData, item.actor, [workflow.token]);
    await genericUtils.update(item, {'system.uses.value': item.system.uses.value - 1});
}
export let grovelthrash = {
    name: 'Grovelthrash',
    version: '0.12.70',
    midi: {
        item: [
            {
                pass: 'damageRollComplete',
                macro: damage,
                priority: 50
            }
        ],
        actor: [
            {
                pass: 'targetApplyDamage',
                macro: damageApplication,
                priority: 50
            }
        ]
    },
    skill: [
        {
            pass: 'context',
            macro: skill,
            priority: 50
        }
    ]
};
export let grovelthrash0 = {
    name: 'Grovelthrash (Dormant)',
    version: grovelthrash.version
};
export let grovelthrash1 = {
    name: 'Grovelthrash (Awakened)',
    version: grovelthrash.version
};
export let grovelthrash2 = {
    name: 'Grovelthrash (Exalted)',
    version: grovelthrash.version,
    equipment: {
        earthquake: {
            name: 'Earthquake',
            compendium: 'personalSpell',
            uses: {
                value: 1,
                per: 'dawn',
                max: 1,
                recovery: 1
            },
            preparation: 'atwill',
            translate: 'CHRISPREMADES.Grovelthrash.Earthquake'
        },
        meldIntoStone: {
            name: 'Meld into Stone',
            compendium: 'personalSpell',
            uses: {
                value: 1,
                per: 'dawn',
                max: 1,
                recovery: 1
            },
            preparation: 'atwill',
            translate: 'CHRISPREMADES.Grovelthrash.MeldIntoStone'
        },
        stoneShape: {
            name: 'Stone Shape',
            compendium: 'personalSpell',
            uses: {
                value: 1,
                per: 'dawn',
                max: 1,
                recovery: 1
            },
            preparation: 'atwill',
            translate: 'CHRISPREMADES.Grovelthrash.StoneShape'
        }
    }
};