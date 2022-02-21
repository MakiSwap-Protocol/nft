import React from 'react'
import styled from 'styled-components'
import { Text, Heading, Card, CardHeader, CardBody, Box, BoxProps } from 'maki-toolkit-v3'
import { useTranslation } from 'contexts/Localization'
import FoldableText from './FoldableText'

interface Props extends BoxProps {
  header: string
  config: { title: string; description: string[] }[]
}

const StyledSectionsWithFoldableTextCard = styled.div`
  width: calc(100% - 3px);
  margin-top: 1px;
  margin-left: 1px;
  margin-bottom: 2px;
  overflow: inherit;
  background: #FFFFFF;
  border-radius: 32px;
`

const SectionsWithFoldableText: React.FC<Props> = ({ header, config, ...props }) => {
  const { t } = useTranslation()

  return (
    <Box maxWidth="888px" {...props}>
      <Card>
        <StyledSectionsWithFoldableTextCard>
          <CardHeader>
            <Heading scale="lg" color="secondary">
              {header}
            </Heading>
          </CardHeader>
          <CardBody>
            {config.map(({ title, description }, i, { length }) => (
              <FoldableText key={title} id={title} mb={i + 1 === length ? '' : '24px'} title={t(title)}>
                {description.map((desc) => {
                  return (
                    <Text key={desc} color="textSubtle" as="p">
                      {t(desc)}
                    </Text>
                  )
                })}
              </FoldableText>
            ))}
          </CardBody>
        </StyledSectionsWithFoldableTextCard>
      </Card>
    </Box>
  )
}

export default SectionsWithFoldableText
