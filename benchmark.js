var isEqual = require('lodash.isequal');

function timeIt(title, task) {
    const start = Date.now()
    const { result, size } = task()
    const end = Date.now()

    console.info(`Benchmark "${title}" ${result ? "succeeded" : "errored"} in ${end - start}ms`)
    console.info(` Buffer length: ${size} bytes`)
    console.info(` `)
}

timeIt("Protobuf", () => {
    const { Type, Field } = require("protobufjs")

    const PersonMessage = new Type("PersonMessage")
        .add(new Field("id", 1, "int32"))
        .add(new Field("name", 2, "string"))
        .add(new Field("roles", 3, "string", "repeated"))
        .add(new Field("health", 4, "int32")) // didn't find int8 type (???)

    const data = {
        id: 123456,
        name: "John Soy",
        roles: ["ZigDeveloper", "Annoyed"],
        health: 100
    }

    const buffer = PersonMessage.encode(data).finish()
    const result = PersonMessage.decode(buffer)

    return {
        result: isEqual(data, {
            id: result.id,
            name: result.name,
            roles: result.roles,
            health: result.health
        }),
        size: buffer.byteLength
    }
})

timeIt("Grechabuf", () => {
    const grechabuf = require("grechabuf")

    const PersonStruct = grechabuf.createStruct({
        id: grechabuf.i32(),
        name: grechabuf.string(),
        roles: grechabuf.array(
            grechabuf.string()
        ),
        health: grechabuf.i8()
    })

    const data = {
        id: 123456,
        name: "John Soy",
        roles: ["ZigDeveloper", "Annoyed"],
        health: 100
    }

    const buffer = PersonStruct.serialize(data)
    const result = PersonStruct.deserialize(new DataView(buffer))

    return {
        result: isEqual(data, result),
        size: buffer.byteLength
    }
})
