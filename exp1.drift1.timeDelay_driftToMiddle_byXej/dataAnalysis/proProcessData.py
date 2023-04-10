import pandas as pd
import os
import glob
DIRNAME = os.path.dirname(__file__)
import matplotlib.pyplot as plt
import numpy as np
from scipy.stats import ttest_ind
import researchpy
import seaborn as sns
import sys
from scipy.stats import t, norm
from scipy import stats

def calculateFirstIntention(goalList):
    for goal in goalList:
        if goal != 0:
            firstGoal = goal
            break
        else:
            firstGoal = None
    return firstGoal


def calculateFirstIntentionConsistency(goalList):
    firstGoal = calculateFirstIntention(goalList)
    finalGoal = calculateFirstIntention(list(reversed(goalList)))
    firstIntention = 1 if firstGoal == finalGoal else 0
    return firstIntention

def calNoisePoint(driftSequence):
    if sum(x for x in driftSequence if x is not None) ==0:
        noisePointList =[]
    else:
        noisePoint = np.where(np.array(driftSequence)==1)[0][0]+1
        noisePointList = [noisePoint]
    return str(noisePointList)

def defineTrialType(trialNum):
    if (int(trialNum) % 9 == 0) and (trialNum != 0):
        return 'Critical Disruption'
    else:
        return 'Random Disruptions'

def calRealTraj(playerPos, realAction):
    trajectory = [playerPos[0]]
    for state, action in zip(playerPos, realAction):
        nextState = [state[0]+action[1], state[1]+action[0]]
        trajectory.append(nextState)

    return str(trajectory)

def isNoiseToOther(trajectory, goalList, noisePoint, target1, target2):
    if noisePoint:
        noisePoint = sorted(noisePoint)
        for noiseStep in noisePoint:
            if sum(goalList[:noiseStep])!= 0:
                currentGoal = calculateFirstIntention(list(reversed(goalList[:noiseStep])))
                playerNextGrid = trajectory[noiseStep]
                nextCloserGoal = calCloserGoal(playerNextGrid, target1, target2)
                if currentGoal != 0 and nextCloserGoal != 0 and currentGoal != nextCloserGoal:
                    return True
    return False

def isNoiseToMiddle(trajectory, goalList, noisePoint, target1, target2):
    if noisePoint:
        for noiseStep in noisePoint:
            if sum(goalList[:noiseStep]) != 0:
                currentGoal = calculateFirstIntention(list(reversed(goalList[:noiseStep])))
                playerNextGrid = trajectory[noiseStep]
                nextCloserGoal = calCloserGoal(playerNextGrid, target1, target2)
                if currentGoal != 0 and nextCloserGoal == 0:
                    return True
    return False

def calCloserGoal(playerGrid, target1, target2):
    disToTarget1 = calculateGridDis(playerGrid,target1)
    disToTarget2 = calculateGridDis(playerGrid,target2)
    if disToTarget1 < disToTarget2:
        goal = 1
    elif disToTarget1 > disToTarget2:
        goal = 2
    else:
        goal = 0
    return goal


def calculateGridDis(grid1, grid2):
    gridDis = np.linalg.norm(np.array(grid1) - np.array(grid2), ord=1)
    return gridDis

def calculateFirstIntentionStep(goalList):
    goal2Step = goal1Step = len(goalList)
    if 1 in goalList:
        goal1Step = goalList.index(1)
    if 2 in goalList:
        goal2Step = goalList.index(2)
    firstIntentionStep = min(goal1Step, goal2Step)
    if goal1Step < goal2Step:
        firstIntention = 1
    elif goal2Step < goal1Step:
        firstIntention = 2
    else:
        firstIntention = 0
    return firstIntentionStep + 1


if __name__ == '__main__':
    df = pd.read_csv('exp1_driftToMiddle_timeDelay5s_freezeWindow_data.csv')
    df['participantsType'] = 'timeDelay5s_freezeWindow'
    df["commitment"] = df.apply(lambda x: calculateFirstIntentionConsistency(eval(x['ifGoal'])), axis=1)

    df['agentType'] = 'Human'

    df['trajectory'] =  df.apply(lambda x: calRealTraj(eval(x['playerPos']), eval(x['realAction'])), axis=1)

    df['bean1GridX'] = df.apply(lambda x: eval(x['goal1Pos'])[0], axis=1)
    df['bean1GridY'] = df.apply(lambda x: eval(x['goal1Pos'])[1], axis=1)
    df['bean2GridX'] = df.apply(lambda x: eval(x['goal2Pos'])[0], axis=1)
    df['bean2GridY'] = df.apply(lambda x: eval(x['goal2Pos'])[1], axis=1)

    df['noisePoint'] = df.apply(lambda x: calNoisePoint(eval(x['driftSequence'])), axis=1)
    # df.to_csv('individual_replication.csv')
    df['trialType'] = df.apply(lambda x: defineTrialType(x['trial']), axis=1)
    df['firstIntentionStep'] = df.apply(lambda x: calculateFirstIntentionStep(eval(x['ifGoal'])), axis=1)


### Critical Disruption
    dfCritical = df[df.trialType == 'Critical Disruption']
    print(researchpy.crosstab(dfCritical['participantsType'], dfCritical['commitment']))
    print('binomial test:', stats.binom_test(sum(dfCritical['commitment']), n=len(dfCritical), p=0.5, alternative='greater')) # two-sided

    ax = sns.barplot(x='participantsType', y="commitment", data=dfCritical, ci=None, errwidth=1, capsize=.05)
    plt.axhline(y=0.5, color='k', linestyle='--', alpha=0.5)
    plt.ylim((0, 0.9))
    ax.bar_label(ax.containers[0])
    plt.show()
    zz


### Random Disruptions
    dfRandom = df[df.trialType == 'Random Disruptions']
    # df = df[df.trialType == 'Critical Disruption']

    dfRandom['hasCriticalNoiseToOther'] = dfRandom.apply(lambda x: isNoiseToOther(eval(x['trajectory']), eval(x['ifGoal']), eval(x['noisePoint']),(x['bean1GridX'],x['bean1GridY']), (x['bean2GridX'],x['bean2GridY'])) ,axis = 1)

    dfRandom['hasCriticalNoiseToMiddle'] = dfRandom.apply(lambda x: isNoiseToMiddle(eval(x['trajectory']), eval(x['ifGoal']), eval(x['noisePoint']),(x['bean1GridX'],x['bean1GridY']), (x['bean2GridX'],x['bean2GridY'])) ,axis = 1)

    dfRandom['hasCriticalNoise'] = dfRandom.apply(lambda x: 1 if x['hasCriticalNoiseToOther'] or x['hasCriticalNoiseToMiddle'] else 0, axis = 1)

    print(researchpy.crosstab(dfRandom['participantsType'], dfRandom['hasCriticalNoise']))
    # zz

# draw to middle
    dfToMiddle = dfRandom[dfRandom.hasCriticalNoiseToMiddle == 1]
    print('NoiseToMiddle', researchpy.crosstab(dfToMiddle['participantsType'], dfToMiddle['commitment']))
    # ax = sns.barplot(x='participantsType', y="commitment", data=dfToMiddle, ci=95, errwidth=1, capsize=.05)
    # plt.show()

# draw to other goal
    dfToOther = dfRandom[dfRandom.hasCriticalNoiseToOther == 1]
    print('NoiseToOther', researchpy.crosstab(dfToOther['participantsType'], dfToOther['commitment']))
    ax = sns.barplot(x='participantsType', y="commitment", data=dfToOther, ci=95, errwidth=1, capsize=.05)
    # plt.show()



### formation

    # first intention steps
    os.environ['R_HOME'] = "/Library/Frameworks/R.framework/Resources"
    from pymer4.models import Lmer

    # dfLogit = df[df.trialType == 'Critical Disruption']
    dfLogit = df
    model = Lmer("commitment  ~ firstIntentionStep  + (1|uniqueid)",
                 data=dfLogit, family = 'binomial')
    print(model.fit())

    sns.regplot(x="firstIntentionStep", y="commitment", data=model.data, fit_reg=True)
    plt.show()
    zz

