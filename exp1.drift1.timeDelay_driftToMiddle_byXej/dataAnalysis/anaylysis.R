require(lme4)
require(ggplot2)
require(reshape2)
library(magrittr)
library(ggeffects)
library(splines)
library(vcd)
library(car)
library(tidyverse)
library(lmerTest)
library(emmeans)
library(pwr)

Exp1Data <- read.csv("Exp1data.csv")
Exp1Data[c('commitment','trialType','participantsType','name')] = lapply(Exp1Data[c('commitment','trialType','participantsType','name')], factor)

# deliberate disruption

## binom.test, not random choose,
ES.h(0.7,0)

binom.test(35, 50, p = 0.5,
           alternative = c( "greater"),
           conf.level = 0.95)

# Random disruption
randomTrial <- subset(Exp1Data, trialType == 'Random Disruptions')
randomTrialCommit = glmer(commitment ~ participantsType + (1 | name), data = randomTrial,family = "binomial"(link='logit'))
summary(randomTrialCommit)
sjPlot::tab_model(randomTrialCommit)

Anova(randomTrialCommit)
ggpredict(randomTrialCommit,c("participantsType"))
ggpredict(randomTrialCommit,c("participantsType")) %>% plot()

lsmeans(randomTrialCommit, pairwise~participantsType, adjust="tukey")
emmeans(randomTrialCommit, list(pairwise ~ participantsType), adjust = "tukey")
emm.s = emmeans(randomTrialCommit, 'participantsType' )
test(emm.s, null = 0, side = ">")


# human commitment formation
humanData = subset(Exp1Data, participantsType == 'Humans')
stepsResultAlltrial = glmer(commitment  ~ firstIntentionStep + (1 | name), data = humanData, family = "binomial"(link='logit'))
summary(stepsResultAlltrial)
ggpredict(stepsResultAlltrial) %>% plot()

sjPlot::tab_model(stepsResultAlltrial)
ggpredict(stepsResultAlltrial)



