import { before, after } from "@vendetta/patcher"
import { getAssetIDByName } from "@vendetta/ui/assets"
import { findByProps, findByName } from "@vendetta/metro"
import { React } from "@vendetta/metro/common"
import { Forms } from "@vendetta/ui/components"
import RawPage from "./RawPage"

const ActionSheet = findByProps("openLazy", "hideActionSheet")
const Navigation = findByProps("push", "pushLazy", "pop")
const DiscordNavigator = findByProps("getRenderCloseButton")
const { default: Navigator, getRenderCloseButton } = DiscordNavigator
const Icon = findByName("Icon")
const { FormRow } = Forms

const unpatch = before("openLazy", ActionSheet, (ctx) => {
    const [component, args, actionMessage] = ctx
    if (args !== "MessageLongPressActionSheet") return
    component.then(instance => {
        const unpatch = after("default", instance, (_, component) => {
            React.useEffect(() => () => { unpatch() }, []) // omg!!!!!!!!!!!!!
            let [msgProps, buttons] = component.props?.children?.props?.children?.props?.children

            const message = msgProps?.props?.message ?? actionMessage?.message

            if (!buttons || !message) return

            const navigator = () => (
                <Navigator
                    initialRouteName="RawPage"
                    goBackOnBackPress
                    screens={{
                        RawPage: {
                            title: "ViewRaw",
                            headerLeft: getRenderCloseButton(() => Navigation.pop()),
                            render: () => <RawPage message={message} />
                        }
                    }}
                />
            )

            buttons.push(
                <FormRow
                    label="View Raw"
                    leading={<Icon source={getAssetIDByName("ic_chat_bubble_16px")} />}
                    onPress={() => {
                        ActionSheet.hideActionSheet()
                        Navigation.push(navigator)
                    }}
                />)
        })
    })
})

export const onUnload = () => unpatch()
