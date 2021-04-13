module.exports = function(sequelize, dataType){
    let sysInfo = sequelize.define("sysInfo", {
        id:{
            filed:"id",
            type: dataType.INTEGER,
            primaryKey: true, 
            autoIncrement: true,
            allowNull: false
        },
        name:{
            filed:"name",
            type: dataType.TEXT,
            allowNull: false
        },
        country1:{
            filed: "country1",
            type: dataType.TEXT,
            allowNull: true
        },
        country2:{
            filed: "country2",
            type: dataType.TEXT,
            allowNull: true
        },
        country3:{
            filed: "country3",
            type: dataType.TEXT,
            allowNull: true
        },
        logo:{
            filed: "logo",
            type: dataType.TEXT,
            allowNull: true
        },
        lmsurl:{
            filed: "lmsurl",
            type: dataType.TEXT,
            allowNull: true
        },
        subscribe:{
            filed: "subscribe",
            type: dataType.BOOLEAN,
            allowNull: false
        },
        latlng:{
            filed: "latlng",
            type: dataType.GEOMETRY('POINT'),
            allowNull: false
        }
    },{
        timestamps: false,
        tableName: "systemInfo"
    });
    return sysInfo;
}
