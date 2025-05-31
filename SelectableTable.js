import React, {useState,useEffect} from "react";
const SelectableTable=({data,columns,getRowId,renderRow,onDeleteSelected})=>{
    const [selected,setSelected]=useState([]);
    const [selectAll,setSelectAll]=useState(false);
    useEffect(()=>{
        setSelectAll(data.length>0 && selected.length===data.length);
    },[selected,data])
    const handleSelectAll=(checked)=>{
        setSelectAll(checked);
        if(checked){
            const allIds=data.map(getRowId);
            setSelected(allIds)
        }else
          setSelected([])
    };
    const handleCheckboxChange=(checked,rowId)=>{
        if(checked){
            setSelected((prev)=>[...prev,rowId]);
        }else 
          setSelected((prev)=>prev.filter((id)=>id!==rowId));
    }
    const handleBulkDelete=()=>{
        onDeleteSelected(selected);
        setSelected([]);
        setSelectAll(false);
    };
    return(
        <div className="table-responsive">
            {selected.length>0 && (
                <div className="mb-2 text-end">
                    <button className="btn btn-danger" onClick={handleBulkDelete}>
                        Delete Selected ({selected.length})
                    </button>
                    </div>
            )}
            <table className="table table-striped table-bordered">
                <thead className="table-dark">
                    <tr>
                        <th>
                            <input type="checkbox" checked={selectAll} onChange={(e)=>handleSelectAll(e.target.checked)} />
                        </th>
                        {columns.map((col)=>(
                            <th key={col.key}>{col.header}</th>
                        ))}
                        <th>Actions</th>
                        </tr>
                </thead>
                <tbody>
                    {data.map((row,index)=>{
                        const rowId=getRowId(row);
                        return(
                            <tr key={rowId}>
                                <td>
                                    <input type="checkbox" checked={selected.includes(rowId)} onChange={(e)=>handleCheckboxChange(e.target.checked,rowId)}
                                    />
                                </td>
                                {renderRow(row,index)}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )   
}
export default SelectableTable;
