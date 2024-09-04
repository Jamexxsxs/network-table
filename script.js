$(document).ready(function(){
    $('#submit').click(function(){
        $('#tableBody').empty();

        var address = $('#address').val().split('.')
        var subnet = $('#subnet').val()
        var Class = getClass(address)
        var OSM = getOSM(Class)
        var BorrowedBits = getBB(subnet)
        var dataNSM = getNSM(BorrowedBits, Class)
        var NumUsableHost = getUH(dataNSM[1])

        $('#classValue').text(Class)
        $('#oldSubnetMask').text(OSM)
        $('#borrowedBits').text(BorrowedBits)
        $('#newSubnetMask').text(dataNSM[0].slice(0, -1))
        $('#usableHosts').text(NumUsableHost)
        $('#delta').text(dataNSM[2])

        for (let i = 0; i <= subnet; i++){
            var netAddress = ''
            var firstHost = ''
            for (let j = 0; j < address.length; j++){
                if (j == dataNSM[3] && i != 0){
                    netAddress += ((address[j] + i * dataNSM[2]) + '.').replace(/^0+/, '')
                }
                else{
                    netAddress += address[j] + '.'
                    
                }

                if(j == 2){
                    firstHost += netAddress
                }
                if(j == 3){
                    firstHost += ((parseInt(netAddress.split('.')[3]) + 1) + '.').replace(/^0+/, '')
                }
            }

            var broadAddress = ''
            var lastHost = ''
            for (let j = 0; j < address.length; j++){
                if (j == dataNSM[3]){
                    broadAddress += (((address[j] + (i + 1) * dataNSM[2]) - 1) + '.').replace(/^0+/, '')
                }
                else if(address[j] == '0'){
                    broadAddress += '255.'
                }
                else{
                    broadAddress += address[j] + '.'
                }

                if(j == 2){
                    lastHost += broadAddress
                }
                if(j == 3){
                    lastHost += ((parseInt(broadAddress.split('.')[3]) - 1) + '.').replace(/^0+/, '')
                }
            }

            var newRow
            if(i != subnet){
                newRow = `
                <tr>
                    <td>${i}</td>
                    <td>${netAddress.slice(0, -1)}</td>
                    <td>${broadAddress.slice(0, -1)}</td>
                    <td>${firstHost.slice(0, -1)}</td>
                    <td>${lastHost.slice(0, -1)}</td>
                </tr>
                `;
            }
            else{
                newRow = `
                <tr>
                    <td></td>
                    <td>${netAddress.slice(0, -1)}</td>
                </tr>
                `;
            }
            
            $('#tableBody').append(newRow);
        }

    })

    function getClass(address){
        if(address[2] != 0){
            return 'C'
        }
        else if(address[1] != 0){
            return 'B'
        }
        else if(address[0] != 0){
            return 'A'
        }
    }

    function getOSM(Class){
        if(Class == 'A'){
            return '255.0.0.0'
        }
        else if(Class == 'B'){
            return '255.255.0.0'
        }
        else if(Class == 'C'){
            return '255.255.255.0'
        }
    }

    function getBB(subnet){
        var i = 0
        while(true){
            if (2**i >= subnet){
                return i
            }
            i++
        }
    }

    function getNSM(BorrowedBits, Class){
        var slide = {
            'A': 8,
            'B': 16,
            'C': 24
        }

        var corrBin = [128, 64, 32, 16, 8, 4, 2, 1]

        var sum = slide[Class] + BorrowedBits
        var diff = 32 - sum

        var binary = ''
        
        for(let i = 0; i < sum; i++){
            binary += '1'
        }
        for(let i = 0; i < diff; i++){
            binary += '0'
        }

        var tempArr = []

        for (let i = 0; i < binary.length; i += 8) {
            tempArr.push(binary.slice(i, i + 8));
        }
        
        var NewSubMask = ''
        var delta
        var octet

        for (let i = 0; i < tempArr.length; i ++){
            if(tempArr[i].includes('1') && tempArr[i].includes('0')){
                var tempSum = 0
                var tempOctet = tempArr[i].split('')
                octet = i

                for(let j = 0; j < tempOctet.length; j++){
                    if(tempOctet[j] == '1'){
                        tempSum += corrBin[j]
                        delta = corrBin[j]
                    }
                    else{
                        NewSubMask += tempSum + '.'
                        break
                    }
                } 
            }
            else if (tempArr[i].includes('1')){
                NewSubMask += '255.'
            }
            else{
                NewSubMask += '0.'
            }
        }

        return [NewSubMask, diff, delta, octet]
    }

    function getUH(diff){
        return (2**diff) - 2
    }

    $('#exportXLSX').click(function() {
        var wb = XLSX.utils.table_to_book(document.getElementById('myTable'));
        XLSX.writeFile(wb, 'table.xlsx');
    });
})