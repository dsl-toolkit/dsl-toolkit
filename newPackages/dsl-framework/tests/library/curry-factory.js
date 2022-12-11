import {dslFrameworkDefaultInstance} from './dsl-framework-factory.js'
const curryString = 'Hey'
const uCurryBuilder = dslFrameworkDefaultInstance()
const curryObject = uCurryBuilder(1, 2, 3, 4, 5)('a', curryString, 'c')()
const curryCallbackObject = uCurryBuilder(() => {})

export default ({ curryString, uCurryBuilder, curryObject, curryCallbackObject })
