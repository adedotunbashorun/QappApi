const fs = require('fs')
const userFiles ='../public'
var url = ''

class File{

    static Image(file,name){
        if (typeof file != 'undefined' || file != "" || file != null) {
            var image = file.replace(/^data:image\/\w+base64,/, "")
            image = image.replace(/ /g, '+')
            var bitmap = new Buffer(image, 'base64')
            url = userFiles+"/images/profile/" + name + Date.now() + ".png"
            fs.writeFileSync(url, bitmap)
            return url
        }
        return ''
    }

    static generalFile(file,name){
        if (typeof file != 'undefined' || file != "" || file != null) {
            const base64data = file.content.replace(/^data:.*,/, '')
            url = userFiles + "/file/" + file + name
            fs.writeFile(userFiles+"/file/" + file + name, base64data, 'base64', (err) => {
                if (err) {
                    return err
                } else {
                    return url
                }
            })
        }
        return ''
    }

    static zipFile(file,name) {

    }

}

module.exports = File